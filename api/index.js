import "dotenv/config";
import Fastify from "fastify";
import fastifyCors from "@fastify/cors";
import fastifyRateLimit from "@fastify/rate-limit";
import pg from "pg";
import path from "path";

const port = process.env.PORT;
const host = process.env.HOST;
const pgConnection = process.env.POSTGRES_URI;
const corsOrigin = process.env.CORS_ORIGIN;
const logLevel = process.env.LOG_LEVEL;

const fastify = Fastify({
    logger: {
        level: logLevel,
        file: path.join(import.meta.dirname, "logfile.log")
    }
})

await fastify.register(fastifyCors, {
    origin: corsOrigin
});
await fastify.register(fastifyRateLimit, {
    max: 100,
    timeWindow: "1 minute"
});

fastify.setErrorHandler(function (error, request, reply) {
  if (error.statusCode == 429) {
    reply.code(429).send({
        error: {
            type: "rate-limit"
        }
    })
  } else {
    request.log.error(error)
    reply.code(500).send({
        error: {
            type: "server-error"
        }
    })
  }
})

fastify.setNotFoundHandler(function (request, reply) {
  reply.code(404).send({
    error: {
        type: "not-found"
    }
  })
})

function clearExpiredSessions() {
    fastify.pg.query(
        "delete from auth.sessions where expire_at < clock_timestamp()",
        [],
        function (error, result) {
            if (error) {
                fastify.log.error(error);
            }
        }
    )
}

function newSession(client, userId, callback) {
    /* usage example
        newSession(
            fastify.pg,
            something.user_id,
            function (result) {
                if (result.error) {
                    request.log.error(result.error.error)
                    reply.send("ERROR: " + result.error.type)
                } else {
                    something.storeSession(
                        result.data.session.id,
                        result.data.session.token
                    )
                }
            }
        )
    */
    clearExpiredSessions()
    client.query(
        "insert into auth.sessions (user_id) " +
        "values ($1) returning id, token",
        [userId],
        function (error, result) {
            if (error) {
                callback({
                    error: {
                        type: "postgres-error22",
                        error: error
                    }
                })
            } else {
                callback({
                    error: false,
                    data: {
                        session: {
                            id: result.rows[0].id,
                            token: result.rows[0].token
                        }
                    }
                })
            }
        }
    )
}

function verifyAndRefreshSession(client, sessionId, sessionToken, callback) {
    /*
        usage example:
        verifyAndRefreshSession(
            fastify.pg,
            something.request.getSessionId
            something.request.getSessionToken,
            function (result) {
                if (result.error) {
                    // there was an error
                    // use result.error.type for error type
                    // log result.error.error for full info
                } else if (result.data.user) {
                    // user session is valid,
                    // result.data.user.id is user's id
                    doSomethingWithUserId(result.data.user.id)
                    //
                    // result.session.id is same session id
                    // result.session.token is new session token
                    something.storeUsersNewSession(
                        result.session.id,
                        result.session.token
                    )
                } else {
                    // user's session is invalid or expired
                    // or mabye user doesn't have an account
                    // result.data.user is false
                }
            }
        )
    */
    if (sessionId && sessionToken) {
    clearExpiredSessions()
    client.query(
        "select id, token, user_id from auth.verify_and_refresh_session($1, $2)",
        [sessionId, sessionToken],
        function (error, result) {
            if (error) {
                callback({
                    error: {
                        type: "postgres-error15",
                        error: error
                    }
                })
            } else {
                if (result.rows.length == 1) {
                    callback({
                        error: false,
                        data: {
                            user: {
                                id: result.rows[0].user_id
                            },
                            session: {
                                id: result.rows[0].id,
                                token: result.rows[0].token
                            }
                        }
                    })
                } else {
                    callback({
                        error: false,
                        data: {
                            user: false
                        }
                    })
                }
            }
        }
    )} else {
        callback({
            error: false,
            data: {
                user: false
            }
        })
    }
}

fastify.post("/sign-up", function (request, reply) {
    /* check if username and password were sent in sign-up request body */
    if (request.body && request.body.username && request.body.password) {
        let username = request.body.username;
        /* regex to check if username has letters or numbers (any alphabet) or dot, underscore, or dash */
        if (/^[\p{L}\p{N}\p{M}._-]+$/u.test(username) && username.length >= 2 && username.length < 100) {
            fastify.pg.query(
                /* check if username already taken */
                "select username from auth.users where username = $1 limit 1",
                [username],
                function (error, result) {
                    if (error) {
                        request.log.error(error)
                        reply.code(500).send({
                            error: {
                                type: "postgres-error"
                            }
                        })
                    } else {
                        if (result.rows.length == 0) {
                            /* if it returned 0 rows, that means this username is not taken, yay */
                            if (request.body.password.length >= 8) {
                                fastify.pg.query(
                                    "insert into auth.users (username, encrypted_password, display_name) " +
                                    "values ($1, crypt($2, gen_salt('bf')), $1) returning id",
                                    [username, request.body.password],
                                    function (error, result) {
                                        if (error) {
                                            request.log.error(error)
                                            reply.code(500).send({
                                                error: {
                                                    type: "postgres-error"
                                                }
                                            })
                                        } else {
                                            /* user_id was generated by postgres when the user was added,
                                            now we send data including the id in the response below */
                                            let userId = result.rows[0].id;
                                            newSession(
                                                fastify.pg,
                                                userId,
                                                function (result) {
                                                    if (result.error) {
                                                        request.log.error(result.error.error);
                                                        reply.code(500).send({
                                                            error: {
                                                                type: result.error.type
                                                            }
                                                        })
                                                    } else {
                                                        reply.send({
                                                            error: false,
                                                            data: {
                                                                user: {
                                                                    id: userId,
                                                                    username: username,
                                                                    displayName: username
                                                                },
                                                                session: {
                                                                    id: result.data.session.id,
                                                                    token: result.data.session.token
                                                                }
                                                            }
                                                        })
                                                    }
                                                }
                                            )
                                        }
                                    }
                                )
                            } else {
                                /* password does not match length */
                                reply.code(400).send({
                                    error: {
                                        type: "password-weak"
                                    }
                                })
                            }
                        } else {
                            /* if the query returned a row, this username is already taken */
                            reply.code(400).send({
                                error: {
                                    type: "username-taken"
                                }
                            })
                        }
                    }
                }
            )
        } else {
            /* username does not match regex or does not match length */
            reply.code(400).send(
                {
                    error: {
                        type: "username-invalid"
                    }
                }
            )
        }
    } else {
        /* password and/or username missing in request.body */
        reply.code(400).send({
            error: {
                type: "fields-missing"
            }
        })
    }
})

fastify.post("/sign-in", function (request, reply) {
    if (request.body && request.body.username && request.body.password) {
        fastify.pg.query(
            "select id, username, display_name from auth.users " +
            "where username = $1 and encrypted_password = crypt($2, encrypted_password) limit 1",
            [request.body.username, request.body.password],
            function (error, result) {
                if (error) {
                    request.log.error(error);
                    reply.code(500).send({
                        error: {
                            type: "postgres-error"
                        }
                    })
                } else {
                    if (result.rows.length == 1) {
                        let user = result.rows[0]
                        newSession(fastify.pg, user.id,
                            function(result) {
                                if (result.error) {
                                    request.log.error(result.error.error);
                                    reply.code(500).send({
                                        error: {
                                            type: result.error.type
                                        }
                                    })
                                } else {
                                    reply.send({
                                        "error": false,
                                        "data": {
                                            user: {
                                                id: user.id,
                                                username: user.username,
                                                displayName: user.display_name
                                            },
                                            session: {
                                                id: result.data.session.id,
                                                token: result.data.session.token
                                            }
                                        }
                                    })
                                }
                            }
                        )
                    } else {
                        /* if no rows are returned, then the username or password is wrong */
                        reply.code(400).send({
                            error: {
                                type: "sign-in-incorrect"
                            }
                        })
                    }
                }
            }
        )
    } else {
        /* password and/or username missing in request.body */
        reply.code(400).send({
            error: {
                type: "fields-missing"
            }
        })
    }
})

fastify.post("/studysets/new", function (request, reply) {
    if (
        request.body &&
        request.body.session &&
        request.body.session.id &&
        request.body.session.token &&
        request.body.studyset &&
        request.body.studyset.title &&
        (
            request.body.studyset.private === true || 
            request.body.studyset.private === false
        ) &&
        request.body.studyset.data
    ) {
        let studysetTitle = request.body.studyset.title || "Untitled Studyset";
        fastify.pg.transact(function (client, commit) {
            verifyAndRefreshSession(
                client,
                request.body.session.id,
                request.body.session.token,
                    function (result) {
                        if (result.error) {
                            request.log.error(result.error);
                            release()
                            reply.code(500).send({
                                error: {
                                    type: result.error.type,
                                    extra: "e"
                                }
                            })
                        } else if (result.data.user) {
                            client.query(
                                "set role quizfreely_auth_user; select set_config('quizfreely_auth.user_id', $1, false)",
                                [result.data.user.id],
                                function (error, result2) {
                                    if (error) {
                                        request.log.error(error);
                                        release()
                                        reply.code(500).send({
                                            error: {
                                                type: "postgres-errorhere"
                                            }
                                        })
                                    } else {
                                        client.query(
                                            "insert into public.studysets (user_id, title, private, data) " +
                                            "values ($1, $2, $3, $4) returning id, user_id, title, private, updated_at",
                                            [
                                                result.data.user.id,
                                                studysetTitle,
                                                request.body.studyset.private,
                                                request.body.studyset.data
                                            ],
                                            function (error, result3) {
                                                if (error) {
                                                    release()
                                                    request.log.error(error)
                                                    reply.code(500).send({
                                                        error: {
                                                            type: "postgres-error3"
                                                        }
                                                    })
                                                } else {
                                                    release()
                                                    reply.send({
                                                        error: false,
                                                        data: {
                                                            studyset: {
                                                                id: result3.rows[0].id,
                                                                userId: result3.rows[0].user_id,
                                                                title: result3.rows[0].title,
                                                                private: result3.rows[0].private,
                                                                updatedAt: result3.rows[0].updated_at
                                                            },
                                                            user: {
                                                                id: result.data.user.id
                                                            },
                                                            session: {
                                                                id: result.data.session.id,
                                                                token: result.data.session.token
                                                            }
                                                        }
                                                    })
                                                }
                                            }
                                        )
                                    }
                                }
                            )
                        } else {
                            release()
                            reply.code(400).send({
                                error: {
                                    type: "session-invalid"
                                }
                            })
                        }
                    }
                )
            })
    } else {
        console.log(request.body)
        reply.code(400).send({
            error: {
                type: "fields-missing"
            }
        })
    }
})

fastify.get("/studysets/:studyset/public", function (request, reply) {
    fastify.pg.query(
        "select id, user_id, title, data, updated_at FROM studysets " +
        "where private = false and id = $1 limit 1",
        [request.params.studyset],
        function (error, result) {
            if (error) {
                request.log.error(error);
                reply.code(500).send({
                    error: {
                        type: "postgres-error"
                    }
                })
            } else {
                if (result.rows.length == 0) {
                    reply.callNotFound();
                } else {
                    let studyset = result.rows[0]
                    getProfile(result.rows[0].user_id, function (result) {
                        if (result.error && result.error.type != "not-found") {
                            request.log.error(result.error.error);
                        }
                        let user = {
                            id: result.data.user.id,
                            username: result.data.user.username,
                            displayName: result.data.user.displayName   
                        }
                        if (result.error) {
                            user = false
                        }
                        reply.send({
                            error: false,
                            data: {
                                studyset: {
                                    id: studyset.id,
                                    userId: studyset.user_id,
                                    title: studyset.title,
                                    data: studyset.data,
                                    updatedAt: studyset.updated_at
                                },
                                user: user
                            }
                        })
                    })
                }
            }
        }
    )
})

function getProfile(userId, callback) {
    fastify.pg.query(
        "select id, username, display_name from public.profiles " +
        "where id = $1",
        [userId],
        function (error, result) {
            if (error) {
                callback({
                    error: {
                        type: "postgres-error",
                        error: error
                    }
                })
            } else {
                if (result.rows.length == 1) {
                    callback({
                        error: false,
                        data: {
                            user: {
                                id: result.rows[0].id,
                                username: result.rows[0].username,
                                displayName: result.rows[0].display_name
                            }
                        }
                    })
                } else {
                    callback({
                        error: {
                            type: "not-found"
                        }
                    })
                }
            }
        }
    )
}

fastify.get("/profiles/:user", function (request, reply) {
    getProfile(request.params.user, function (result) {
        if (result.error) {
            if (result.error.type == "not-found") {
                reply.callNotFound();
            } else {
                request.log.error(result.error.error);
                reply.code(500).send({
                    error: {
                        type: result.error.type
                    }
                });
            }
        } else {
            reply.send({
                error: false,
                data: {
                    user: result.data.user
                }
            })
        }
    })
})

fastify.listen({
    port: port,
    host: host
})
