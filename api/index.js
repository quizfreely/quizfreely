import "dotenv/config";
import Fastify from "fastify";
import mercurius from "mercurius";
import fastifyCompress from "@fastify/compress";
import fastifyCors from "@fastify/cors";
import fastifyCookie from "@fastify/cookie";
import fastifyOauth2 from "@fastify/oauth2";
import pg from "pg";
const { Pool, Client } = pg;
import path from "path";
import { writeFile } from "node:fs";
import { Cron } from "croner";

const PORT = process.env.PORT;
const HOST = process.env.HOST;
const POSTGRES_URI = process.env.POSTGRES_URI;
const CORS_ORIGIN = process.env.CORS_ORIGIN;
const COOKIES_DOMAIN = process.env.COOKIES_DOMAIN;
const LOG_LEVEL = process.env.LOG_LEVEL;
const LOG_PRETTY = process.env.LOG_PRETTY || "false";
const OAUTH_GOOGLE_ID = process.env.OAUTH_GOOGLE_CLIENT_ID;
const OAUTH_GOOGLE_SECRET = process.env.OAUTH_GOOGLE_CLIENT_SECRET;
const API_OAUTH_CALLBACK = process.env.API_OAUTH_CALLBACK_URL
const WEB_OAUTH_CALLBACK = process.env.WEB_OAUTH_CALLBACK_URL;
const CRON_DELETE_EXPIRED_SESSIONS = process.env.CRON_DELETE_EXPIRED_SESSIONS || "false";
const CRON_DELETE_EXPIRED_SESSIONS_INTERVAL = process.env.CRON_DELETE_EXPIRED_SESSIONS_INTERVAL;
const CRON_CLEAR_LOGS = process.env.CRON_CLEAR_LOGS || "false";
const CRON_CLEAR_LOGS_INTERVAL = process.env.CRON_CLEAR_LOGS_INTERVAL;

if (PORT == undefined || HOST == undefined) {
    console.error(
        "quizfreely/api/.env is missing or invalid \n" +
        "copy .env.example to .env"
    );
    process.exit(1);
}

let loggerConfig = {
    level: LOG_LEVEL,
    file: path.join(import.meta.dirname, "quizfreely-api.log")
  };
if (LOG_PRETTY == "true") {
    loggerConfig = {
      level: LOG_LEVEL,
      transport: {
        targets: [
          {
            target: "pino-pretty",
            
          },
          {
            target: "pino/file",
            options: {
              destination: path.join(import.meta.dirname, "quizfreely-api.log")
            }
          }
        ]
      },
    };
}
const fastify = Fastify({
    logger: loggerConfig
})

await fastify.register(
    fastifyCompress
);
await fastify.register(fastifyCors, {
    origin: CORS_ORIGIN
});
/*
    "if you need @fastify/cookie yourself,
    you will need to register it before @fastify/oauth2"
*/
await fastify.register(fastifyCookie)
await fastify.register(fastifyOauth2, {
    name: "googleOAuth2",
    scope: ["openid", "profile", "email"],
    credentials: {
      client: {
        id: OAUTH_GOOGLE_ID,
        secret: OAUTH_GOOGLE_SECRET
      },
      auth: fastifyOauth2.GOOGLE_CONFIGURATION
    },
    startRedirectPath: "/oauth/google",
    callbackUri: API_OAUTH_CALLBACK,
    cookie: {
        path: "/",
        secure: true,
        sameSite: "lax",
        httpOnly: true
    },
    pkce: "S256"
})

fastify.setErrorHandler(function (error, request, reply) {
    if (error.statusCode < 500) {
        request.log.warn(error)
        reply.code(error.statusCode).send({
            error: error
        });
    } else if (error.statusCode >= 100 && error.statusCode <= 599) {
        request.log.error(error)
        reply.code(error.statusCode).send({
            error: error
        });
    } else {
        request.log.error(error)
        reply.code(500).send({
            error: error
        });
    }
})

fastify.setNotFoundHandler(function (request, reply) {
  reply.code(404).send({
    error: {
        code: "NOT_FOUND",
        statusCode: 404,
        message: "404 Not Found"
    }
  });
})

const pool = new Pool({
    connectionString: POSTGRES_URI
});

const schema = `
    type Query {
        authed: Boolean
        authedUser: AuthedUser
        studyset(id: ID!, withAuth: Boolean!): Studyset
        user(id: ID!): User
        featuredStudysets(limit: Int, offset: Int): [Studyset]
        recentStudysets(limit: Int, offset: Int): [Studyset]
        searchStudysets(q: String!, limit: Int, offset: Int): [Studyset]
        searchQueries(q: String!, limit: Int, offset: Int): [SearchQuery]
    }
    type Mutation {
        createStudyset(studyset: StudysetInput!): Studyset
        updateStudyset(id: ID!, studyset: StudysetInput): Studyset
        deleteStudyset(id: ID!): ID
        updateUser(display_name: String): AuthedUser
    }
    type User {
        id: ID
        username: String
        display_name: String
    }
    type AuthedUser {
        id: ID
        username: String
        display_name: String
        auth_type: AuthType
        oauth_google_email: String
    }
    enum AuthType {
        username_password
        oauth_google
    }
    type Studyset {
        id: ID
        title: String
        private: Boolean
        user_id: ID
        user_display_name: String
        data: StudysetData
        terms_count: Int
    }
    type StudysetData {
        terms: [[String]]
    }
    input StudysetInput {
        title: String!
        private: Boolean!
        data: StudysetDataInput!
    }
    input StudysetDataInput {
        terms: [[String]]
    }
    type SearchQuery {
        query: String
        subject: String
    }
`;

const resolvers = {
    Query: {
        authed: async function (_, args, context) {
            return context.authed;
        },
        authedUser: async function (_, args, context) {
            if (context.authed) {
                return context.authedUser
            } else {
                return null;
            }
        },
        studyset: async function (_, args, context) {
            if (args.withAuth == false) {
                let result = await getPublicStudyset(args.id);
                if (result.error) {
                    context.reply.request.log.error(result.error);
                    throw new mercurius.ErrorWithProps(
                        result.error.message,
                        result.error
                    )
                } else {
                    /* getPublicStudyset().data is studyset json on sucess, null on not found, and undefined on error */
                    return result.data;
                }
            } else if (context.authed) /* withAuth is true, and context.authed is true (signed in) */ {
                let result = await getStudyset(args.id, context.authedUser.id);
                if (result.error) {
                    context.reply.request.log.error(result.error);
                    throw new mercurius.ErrorWithProps(
                        result.error.message,
                        result.error
                    )
                } else {
                    /* getStudyset().data is studyset json on success, null on not found, and undefined on error */
                    return result.data;
                }
            } else /* withAuth is true, but context.auth is false (not signed in) */ {
                throw new mercurius.ErrorWithProps("Not signed in while trying to view studyset. Use `withAuth: false` for unauthed requests", { code: "NOT_AUTHED" });
            }
        },
        user: async function (_, args, context) {
            let result = await getUser(args.id);
            if (result.error) {
                context.reply.request.log.error(result.error);
                throw new mercurius.ErrorWithProps(
                    result.error.message,
                    result.error
                );
            } else {
                return result.data;
            }
        },
        featuredStudysets: async function (_, args, context) {
            /* use nullish coalescing thingy, `??`, to default to 3 for limit and 0 for offset */
            let result = await featuredStudysets(args.limit ?? 3, args.offset ?? 0)
            if (result.error) {
                context.reply.request.log.error(result.error);
                throw new mercurius.ErrorWithProps(
                    result.error.message,
                    result.error
                );
            } else {
                return result.data
            }
        },
        recentStudysets: async function (_, args, context) {
            /* use nullish coalescing thingy, `??`, to default to 3 for limit and 0 for offset */
            let result = await recentStudysets(args.limit ?? 3, args.offset ?? 0)
            if (result.error) {
                context.reply.request.log.error(result.error);
                throw new mercurius.ErrorWithProps(
                    result.error.message,
                    result.error
                );
            } else {
                return result.data
            }
        },
        searchStudysets: async function (_, args, context) {
            let result = await searchStudysets(args.q, args?.limit ?? 10, args?.offset ?? 0);
            if (result.error) {
                context.reply.request.log.error(result.error);
                throw new mercurius.ErrorWithProps(
                    result.error.message,
                    result.error
                );
            } else {
                return result.data
            }
        },
        searchQueries: async function (_, args, context) {
            let result = await searchQueries(args.q, args?.limit ?? 5, args?.offset ?? 0);
            if (result.error) {
                context.reply.request.log.error(result.error);
                throw new mercurius.ErrorWithProps(
                    result.error.message,
                    result.error
                );
            } else {
                return result.data
            }
        }
    },
    Mutation: {
        createStudyset: async function (_, args, context) {
            if (context.authed) {
                let result = await createStudyset(args.studyset, context.authedUser.id);
                if (result.error) {
                    context.reply.request.log.error(result.error);
                    throw new mercurius.ErrorWithProps(
                        result.error.message,
                        result.error
                    )
                } else {
                    return result.data;
                }
            } else /* auth is false (not signed in) */ {
                throw new mercurius.ErrorWithProps("Not signed in while trying to create studyset", { code: "NOT_AUTHED" });
            }
        },
        updateStudyset: async function (_, args, context) {
            if (context.authed) {
                let result = await updateStudyset(args.id, args.studyset, context.authedUser.id);
                if (result.error) {
                    context.reply.request.log.error(result.error);
                    throw new mercurius.ErrorWithProps(
                        result.error.message,
                        result.error
                    )
                } else {
                    return result.data;
                }
            } else /* auth is false (not signed in) */ {
                throw new mercurius.ErrorWithProps("Not signed in while trying to update studyset", { code: "NOT_AUTHED" });
            }
        },
        deleteStudyset: async function (_, args, context) {
            if (context.authed) {
                let result = await deleteStudyset(args.id, context.authedUser.id);
                if (result.error) {
                    context.reply.request.log.error(result.error);
                    throw new mercurius.ErrorWithProps(
                        result.error.message,
                        result.error
                    )
                } else {
                    return result.data;
                }
            } else /* auth is false (not signed in) */ {
                throw new mercurius.ErrorWithProps("Not signed in while trying to delete studyset", { code: "NOT_AUTHED" });
            }
        },
        updateUser: async function (_, args, context) {
            if (context.authed) {
                let result = await updateUser({
                    display_name: args?.display_name
                });
                if (result.error) {
                    context.reply.request.log.error(result.error);
                    throw new mercurius.ErrorWithProps(
                        result.error.message,
                        result.error
                    )
                } else {
                    return result.data;
                }
            } else /* ontext.authed is false (not signed in) */ {
                throw new mercurius.ErrorWithProps("Not signed in while trying to update user", { code: "NOT_AUTHED" });
            }
        }
    }
}

async function context(request, reply) {
    if ((
        /* check for Authorization header */
        request.headers.authorization &&
        request.headers.authorization.toLowerCase().startsWith("bearer ")
    ) || (
        /* or check for Auth cookie */
        request.cookies && request.cookies.auth
    )) {
        /*
            "Bearer " (with space) is 6 characters, so 7 is where our token starts
            We're using optional chaining (?.) with an OR (||), so that if the auth header isn't there, it uses the auth cookie
        */
        let authToken = request.headers?.authorization?.substring(7) || request.cookies.auth;
        let client = await pool.connect();
        try {
            await client.query("BEGIN");
            await client.query("set role quizfreely_auth");
            let session = await client.query(
                "select user_id from auth.verify_session($1)",
                [ authToken ]
            );
            if (session.rows.length == 1) {
                let userData = await client.query(
                    "select id, username, display_name, auth_type, oauth_google_email from auth.users " +
                    "where id = $1",
                    [
                        session.rows[0].user_id
                    ]
                );
                if (userData.rows.length == 1) {
                    await client.query("COMMIT");
                    return {
                        authed: true,
                        authedUser: userData.rows[0],
                        token: authToken
                    };
                } else {
                    await client.query("ROLLBACK");
                    return {
                        authed: false
                    };
                }
            } else {
                await client.query("ROLLBACK");
                return {
                    authed: false
                };
            }
        } catch (error) {
            await client.query("ROLLBACK");
            request.log.error(error);
            return {
                authed: false
            }
        } finally {
            client.release()
        }
    } else {
        return {
            authed: false
        }
    }
}

await fastify.register(mercurius, {
    schema: schema,
    resolvers: resolvers,
    context: context,
    graphiql: true
});

/*
    on sucess, returns: {
        data: studysetJson
    }
    on not found, returns: {
        data: null
    }
    on error, returns: {
        error: errorObj
    }
*/
async function getPublicStudyset(id) {
    try {
        let result = await pool.query(
            "select s.id, s.user_id, u.display_name as user_display_name, s.title, s.data, s.updated_at, s.terms_count " +
            "from public.studysets s inner join public.profiles u on s.user_id = u.id " +
            "where s.id = $1 and s.private = false limit 1",
            [ id ]
        )
        if (result.rows.length == 1) {
            return {
                data: result.rows[0]
            };
        } else {
            return {
                data: null
            };
        }
    } catch (error) {
        return {
            error: error
        }
    }
}

/*
    on sucess, returns: {
        data: studysetJson
    }
    on not found, returns: {
        data: null
    }
    on error, returns: {
        error: errorObj
    }
*/
async function getStudyset(id, authedUserId) {
    let result;
    let client = await pool.connect();
    try {
        await client.query("BEGIN");
        await client.query("set role quizfreely_auth_user");
        await client.query(
            "select set_config('quizfreely_auth.user_id', $1, true)",
            [ authedUserId ]
        );
        let selectedStudyset = await client.query(
            "select id, user_id, title, private, data, updated_at from public.studysets " +
            "where id = $1 and (private = false or user_id = $2)",
            [ id, authedUserId ]
        );
        if (selectedStudyset.rows.length == 1) {
            await client.query("COMMIT")
            result = {
                data: selectedStudyset.rows[0]
            }
        } else {
            await client.query("ROLLBACK");
            result = {
                data: null
            };
        }
    } catch (error) {
        await client.query("ROLLBACK");
        result = {
            error: error
        }
    } finally {
        client.release()
        return result;
    }
}

async function createStudyset(studyset, authedUserId) {
    let result;
    let client = await pool.connect();
    try {
        await client.query("BEGIN");
        await client.query("set role quizfreely_auth_user");
        await client.query("select set_config('quizfreely_auth.user_id', $1, true)", [
            authedUserId
        ]);
        let insertedStudyset = await client.query(
            "insert into public.studysets (user_id, title, private, data, terms_count) " +
            "values ($1, $2, $3, $4, $5) returning id, user_id, title, private, terms_count, updated_at",
            [
                authedUserId,
                studyset.title,
                studyset.private,
                studyset.data,
                /* we use optional chaining (that .?) and nullish coalescing (that ??) to default to 0 (without throwing an error) if terms or terms.length are undefined */
                studyset.data?.terms?.length ?? 0
            ]
        );
        await client.query("COMMIT")
        result = {
            data: {
                id: insertedStudyset.rows[0].id,
                user_id: insertedStudyset.rows[0].user_id,
                title: insertedStudyset.rows[0].title,
                private: insertedStudyset.rows[0].private,
                terms_count: insertedStudyset.rows[0].terms_count,
                updated_at: insertedStudyset.rows[0].updated_at
            }
        }
    } catch (error) {
        await client.query("ROLLBACK");
        result = {
            error: error
        }
    } finally {
        client.release()
        return result;
    }
}

async function updateStudyset(id, studyset, authedUserId) {
    let result;
    let client = await pool.connect();
    try {
        await client.query("BEGIN");
        await client.query("set role quizfreely_auth_user");
        await client.query("select set_config('quizfreely_auth.user_id', $1, true)", [
            authedUserId
        ]);
        let updatedStudyset = await client.query(
            "update public.studysets set title = $2, private = $3, data = $4, terms_count = $5, updated_at = clock_timestamp() " +
            "where id = $1 returning id, user_id, title, private, terms_count, updated_at",
            [
                id,
                studyset.title,
                studyset.private,
                studyset.data,
                /* we use optional chaining (that .?) and nullish coalescing (that ??) to default to 0 (without throwing an error) if terms or terms.length are undefined */
                studyset.data?.terms?.length ?? 0
            ]
        );
        if (updatedStudyset.rows.length == 1) {
            await client.query("COMMIT")
            result = {
                data: {
                    id: updatedStudyset.rows[0].id,
                    user_id: updatedStudyset.rows[0].user_id,
                    title: updatedStudyset.rows[0].title,
                    private: updatedStudyset.rows[0].private,
                    terms_count: updatedStudyset.rows[0].terms_count,
                    updated_at: updatedStudyset.rows[0].updated_at
                }
            }
        } else {
            await client.query("ROLLBACK");
            /*
                returns { data: studysetJson } on sucess,
                returns { data: null } on not found
                returns { error: errorObj } on error
            */
            result = {
                data: null
            };
        }
    } catch (error) {
        await client.query("ROLLBACK");
        result = {
            error: error
        }
    } finally {
        client.release()
        return result;
    }
}

async function deleteStudyset(id, authedUserId) {
    let result;
    let client = await pool.connect();
    try {
        await client.query("BEGIN");
        await client.query("set role quizfreely_auth_user");
        await client.query("select set_config('quizfreely_auth.user_id', $1, true)", [
            authedUserId
        ]);
        await client.query(
            "delete from public.studysets " +
            "where id = $1",
            [
                id
            ]
        );
        await client.query("COMMIT")
        result = {
            data: id
        }
    } catch (error) {
        await client.query("ROLLBACK");
        result = {
            error: error
        }
    } finally {
        client.release()
        return result;
    }
}

/*
    on sucess, returns: {
        data: studysetJson
    }
    on not found, returns: {
        data: null
    }
    on error, returns: {
        error: errorObj
    }
*/
async function getUser(id) {
    try {
        let result = await pool.query(
            "select id, username, display_name from public.profiles " +
            "where id = $1",
            [ id ]
        )
        if (result.rows.length == 1) {
            return {
                data: {
                    id: result.rows[0].id,
                    username: result.rows[0].username,
                    display_name: result.rows[0].display_name
                }
            }
        } else {
            return null;
        }
    } catch (error) {
        return {
            error: error
        }
    }
}

async function featuredStudysets(limit, offset) {
    try {
        let result = await pool.query(
            "select s.id, s.user_id, u.display_name as user_display_name, s.title, s.updated_at, s.terms_count " +
            "from public.studysets s inner join public.profiles u on s.user_id = u.id " +
            "where s.featured = true and s.private = false order by s.updated_at desc limit $1 offset $2",
            [ limit, offset ]
        )
        return {
            data: result.rows
        }
    } catch (error) {
        return {
            error: error
        }
    }
}

async function recentStudysets(limit, offset) {
    try {
        let result = await pool.query(
            "select s.id, s.user_id, u.display_name as user_display_name, s.title, s.updated_at, s.terms_count " +
            "from public.studysets s inner join public.profiles u on s.user_id = u.id " +
            "where s.private = false order by s.updated_at desc limit $1 offset $2",
            [ limit, offset ]
        )
        return {
            data: result.rows
        }
    } catch (error) {
        return {
            error: error
        }
    }
}

/* right now this only updates display_name, using updateUser(userIdHere, { display_name: "newDisplayNameHere" }) */
async function updateUser(authedUserId, updatedThingies) {
    let result;
    let client = await pool.connect();
    try {
        await client.query("BEGIN");
        await client.query("set role quizfreely_auth");
        if (request.body.display_name) {
            let userData = await client.query(
                "update auth.users set display_name = $2 " +
                "where id = $1 returning id, username, display_name",
                [
                    authedUserId,
                    updatedThingies.display_name
                ]
            );
            if (userData.rows.length == 1) {
                await client.query("COMMIT");
                result = {
                    "error": false,
                    data: {
                        id: userData.rows[0].id,
                        username: userData.rows[0].username,
                        display_name: userData.rows[0].display_name
                    }
                }
            } else {
                await client.query("ROLLBACK");
                result = null;
            }
        }
    } catch (error) {
        await client.query("ROLLBACK");
        result = {
            error: error
        }
    } finally {
        client.release()
        return result;
    }
}

async function searchStudysets(query, limit, offset) {
    try {
        let result = await pool.query(
            "select s.id, s.user_id, u.display_name, s.title, s.updated_at, s.terms_count " +
            "from public.studysets s inner join public.profiles u on s.user_id = u.id " +
            "where s.private = false and tsvector_title @@ websearch_to_tsquery('english', $1) " +
            "limit $2 offset $3",
            [
                query,
                limit,
                offset
            ]
        )
        return {
            data: result.rows
        };
    } catch (error) {
        return {
            error: error
        };
    }
}

async function searchQueries(query, limit, offset) {
    try {
        /*
            replace whitespace (tabs, spaces, etc and multiple) with a space
            whitespace characters next to eachother will be replaced with a single space
        */
        let spaceRegex = /\s+/gu;
        let inputQuery = query.replaceAll(spaceRegex, " ");
        /* after that, replace and sign ("&") with "and" */
        inputQuery = inputQuery.replaceAll("&", "and");
        /*
            after "sanitizing" spaces, remove special characters
            this will keep letters (any alphabet) accent marks, numbers (any alphabet), underscore, period/dot, and dashes
        */
        let rmRegex = /[^\p{L}\p{M}\p{N} _.-]/gu;
        inputQuery = inputQuery.replaceAll(rmRegex, "");
        let result;
        if (inputQuery.length <= 3) {
            result = await pool.query(
                "select query, subject from public.search_queries " +
                "where query ilike $1 limit $2 offset $3",
                [
                    /* percent sign (%) to match querys that start with inputQuery */
                    (inputQuery + "%"),
                    limit,
                    offset
                ]
            )
        } else {
            result = await pool.query(
                "select query, subject from public.search_queries " +
                "where similarity(query, $1) > 0.15 " +
                "order by similarity(query, $1) desc limit $2 limit $3",
                [
                    inputQuery,
                    limit,
                    offset
                ]
            )
        }
        return {
            data: result.rows
        }
    } catch (error) {
        return {
            error: error
        }
    }
}

async function googleAuthCallback(tokenObj) {
    try {
        let response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
            method: "GET",
            headers: {
                Authorization: "Bearer " + tokenObj.access_token
            }
          }
        );
        let userinfo = await response.json();
        let client = await pool.connect();
        try {
            await client.query("BEGIN");
            await client.query("set role quizfreely_auth");
            let upsertedUser = await client.query(
                "insert into auth.users (display_name, auth_type, oauth_google_id, oauth_google_email) " +
                "values ($1, 'oauth_google', $2, $3) on conflict (oauth_google_id) do update " +
                "set oauth_google_email = $3 returning id, display_name",
                [
                    userinfo.name,
                    userinfo.id,
                    userinfo.email
                ]
            );
            /* after using google auth token and user id, create new session and get quizfreely auth token */
            let newSession = await client.query(
                "insert into auth.sessions (user_id) values ($1) returning token, user_id",
                [upsertedUser.rows[0].id]
            )
            await client.query("COMMIT");
            return {
                error: false,
                data: {
                    user: {
                        id: upsertedUser.rows[0].id,
                        display_name: upsertedUser.rows[0].id
                    },
                },
                /* send quizfreely auth token in return obj to use setCookie with it (below) */
                auth: newSession.rows[0].token
            }
        } catch (error) {
            await client.query("ROLLBACK");
            return {
                error: {
                    type: "db-error",
                    error: error
                }
            }
        } finally {
            client.release();
        }
    } catch (error) {
        return {
            error: {
                type: "fetch-error",
                error: error
            }
        }
    }
}

fastify.get('/oauth/google/callback', function (request, reply) {
    // Note that in this example a "reply" is also passed, it's so that code verifier cookie can be cleaned before
    // token is requested from token endpoint
    fastify.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request, reply, function (error, result) {
        if (error) {
            request.log.error(error);
            reply.redirect(WEB_OAUTH_CALLBACK + "?error=oauth-error");
        } else {
            googleAuthCallback(result.token).then(
                function (result) {
                    if (result.error) {
                        request.log.error(result.error.error)
                        reply.redirect(WEB_OAUTH_CALLBACK + "?error=oauth-error")
                    } else {
                        reply.setCookie(
                            "auth",
                            result.auth,
                            {
                                domain: COOKIES_DOMAIN,
                                path: "/",
                                signed: false,
                                /* 10 days * 24 h per day * 60 min per h * 60 sec per min = 864000 seconds in 10 days */
                                maxAge: 864000,
                                httpOnly: true,
                                sameSite: "lax",
                                /* when secure is true,
                                browsers only send the cookie through https,
                                on localhost, browsers send it even if localhost isn't using https */
                                secure: true
                            }
                        );
                        reply.redirect(WEB_OAUTH_CALLBACK)
                    }
                }
            )
        }
    })
})

function routes(fastify, options, done) {
fastify.post("/auth/sign-up", {
    schema: {
        body: {
            type: "object",
            properties: {
                username: { type: "string" },
                password: { type: "string", minLength: 8, maxLength: 9000 }
            },
            required: ["username", "password"]
        }
    }
}, async function (request, reply) {
    let username = request.body.username;
     /* regex to check if username has letters (any alphabet, but no uppercase) or numbers (any alphabet) or dot, underscore, or dash */
    if (/^(?!.*\p{Lu})[\p{L}\p{M}\p{N}._-]+$/u.test(username) && username.length >= 2 && username.length < 100) {
        let client = await pool.connect();
        try {
            await client.query("BEGIN");
            await client.query("set role quizfreely_auth");
            let result = await client.query(
                "select username from auth.users where username = $1 limit 1",
                [username]
            );
            if (result.rows.length == 0) {
                let result2 = await client.query(
                    "insert into auth.users (username, encrypted_password, display_name, auth_type) " +
                    "values ($1, crypt($2, gen_salt('bf')), $1, 'username_password') returning id",
                    [username, request.body.password]
                );
                let userId = result2.rows[0].id;
                let session = await client.query(
                    "insert into auth.sessions (user_id) values ($1) returning token, user_id",
                    [userId]
                );
                await client.query("COMMIT");
                reply.setCookie(
                    "auth",
                    session.rows[0].token,
                    {
                        domain: COOKIES_DOMAIN,
                        path: "/",
                        signed: false,
                        /* 10 days * 24 h per day * 60 min per h * 60 sec per min = 864000 seconds in 10 days */
                        maxAge: 864000,
                        httpOnly: true,
                        sameSite: "lax",
                        /* when secure is true,
                        browsers only send the cookie through https,
                        on localhost, browsers send it even if localhost isn't using https */
                        secure: true
                    }
                );
                return reply.send({
                    error: false,
                    data: {
                        user: {
                            id: userId,
                            username: username,
                            display_name: username
                        },
                    }
                })
            } else {
                await client.query("ROLLBACK");
                return reply.code(400).send({
                    error: {
                        type: "username-taken"
                    }
                })
            }
        } catch (error) {
            await client.query("ROLLBACK");
            request.log.error(error);
            return reply.code(500).send({
                error: {
                    type: "db-error"
                }
            })
        } finally {
            /* finally block will execute even though we put return statements in try block or catch block
            which is good for our use case :D */
            client.release();
        }
    } else {
        /* username does not match regex or does not match length */
        return reply.code(400).send(
            {
                error: {
                    type: "username-invalid"
                }
            }
        )
    }
})

fastify.post("/auth/sign-in", {
    schema: {
        body: {
            type: "object",
            properties: {
                username: { type: "string" },
                password: { type: "string", maxLength: 9000 }
            },
            required: ["username", "password"]
        }
    }
}, async function (request, reply) {
    let client = await pool.connect();
    try {
        await client.query("BEGIN");
        await client.query("set role quizfreely_auth");
        let result = await client.query(
            "select id, username, display_name from auth.users " +
            "where username = $1 and encrypted_password = crypt($2, encrypted_password) limit 1",
            [request.body.username, request.body.password]
        )
        if (result.rows.length == 1) {
            let session = await client.query(
                "insert into auth.sessions (user_id) values ($1) returning token, user_id",
                [result.rows[0].id]
            )
            await client.query("COMMIT");
            reply.setCookie(
                "auth",
                session.rows[0].token,
                {
                    domain: COOKIES_DOMAIN,
                    path: "/",
                    signed: false,
                    /* 10 days * 24 h per day * 60 min per h * 60 sec per min = 864000 seconds in 10 days */
                    maxAge: 864000,
                    httpOnly: true,
                    sameSite: "lax",
                    /* when secure is true,
                    browsers only send the cookie through https,
                    on localhost, browsers send it even if localhost isn't using https */
                    secure: true
                }
            );
            return reply.send({
                error: false,
                data: {
                    user: {
                        id: result.rows[0].id,
                        username: result.rows[0].username,
                        display_name: result.rows[0].display_name
                    },
                }
            })
        } else {
            await client.query("ROLLBACK");
            return reply.code(400).send({
                error: {
                    type: "sign-in-incorrect"
                }
            })
        }
    } catch (error) {
        await client.query("ROLLBACK");
        request.log.error(error);
        return reply.code(500).send({
            error: {
                type: "db-error"
            }
        })
    } finally {
        client.release();
    }
})

fastify.post("/auth/sign-out", async function (request, reply) {
    if (
        (
            /* check for Authorization header */
            request.headers.authorization &&
            request.headers.authorization.toLowerCase().startsWith("bearer ")
        ) || (
            /* or check for Auth cookie */
            request.cookies && request.cookies.auth
        )
    ) {
        /*
            "Bearer " (with space) is 6 characters, so 7 is where our token starts
            We're using optional chaining (?.) with an OR (||), so that if the auth header isn't there, it uses the auth cookie
        */
        let authToken = request.headers?.authorization?.substring(7) || request.cookies.auth;
        let client = await pool.connect();
        try {
            await client.query("BEGIN");
            await client.query("set role quizfreely_auth");
            await client.query(
                "delete from auth.sessions where token = $1",
                [ authToken ]
            );
            await client.query("COMMIT");
            reply.clearCookie(
                "auth",
                {
                    domain: COOKIES_DOMAIN,
                    path: "/",
                    signed: false,
                    maxAge: 864000,
                    httpOnly: true,
                    sameSite: "lax",
                    secure: true
                }
            )
            return reply.send({
                "error": false,
                "data": {}
            })
        } catch (error) {
            await client.query("ROLLBACK");
            request.log.error(error);
            return reply.code(500).send({
                error: {
                    type: "db-error"
                }
            })
        } finally {
            client.release()
        }
    } else {
        /*
            401 Unauthorized means the client is NOT logged in or authenticated
            403 Forbidden means the client is logged in but not allowed,
            so in this case we're responding with a 401 if our Authentication header is missing
        */
        return reply.code(401).send({
            error: {
                type: "auth-missing"
            }
        })
    }
})

fastify.get("/auth/user", async function (request, reply) {
    const authContext = await context(request, reply);
    if (authContext.authed) {
        return reply.send({
            data: {
                authedUser: authContext.authedUser,
                authed: true
            }
        })
    } else {
        return reply.send({
            data: {
                authed: false
            }
        })
    }
})

fastify.patch("/auth/user", {
    schema: {
        body: {
            type: "object",
            properties: {
                display_name: {
                    type: "string",
                    minLength: 1,
                    maxLength: 9000
                }
            }
        }
    }
}, async function (request, reply) {
    if (
        (
            /* check for Authorization header */
            request.headers.authorization &&
            request.headers.authorization.toLowerCase().startsWith("bearer ")
        ) || (
            /* or check for Auth cookie */
            request.cookies && request.cookies.auth
        )
    ) {
        /*
            "Bearer " (with space) is 6 characters, so 7 is where our token starts
            We're using optional chaining (?.) with an OR (||), so that if the auth header isn't there, it uses the auth cookie
        */
        let authToken = request.headers?.authorization?.substring(7) || request.cookies.auth;
        if (
            (request.body.display_name /* || request.body. */)
        ) { 
        } else {
            return reply.code(400).send({
                error: {
                    code: "fields missing but different"
                }
            })
        }
    } else {
        return reply.code(401).send({
            error: {
                type: "auth-missing"
            }
        })
    }
})

fastify.get("/public/users/:userid", async function (request, reply) {
    let result = await getUser(request.params.userid);
    if (result.error) {
        request.log.error(result.error);
        return reply.code(500).send({
            error: result.error
        })
    } else if (result.data === null) {
        return reply.callNotFound();
    } else {
        return reply.send({
            data: {
                user: result.data
            }
        })
    }
})

fastify.post("/studysets", {
    schema: {
        body: {
            type: "object",
            properties: {
                studyset: {
                    type: "object",
                    properties: {
                        title: { type: "string", maxLength: 9000 },
                        private: { type: "boolean" },
                        data: { type: "object" }
                    },
                    required: ["title", "private", "data"]
                }
            },
            required: ["studyset"]
        }
    }
}, async function (request, reply) {
    const authContext = await context(request, reply);
    if (authContext.authed) {
        let result = await createStudyset(request.body.studyset, authContext.authedUser.id);
        if (result.error) {
            request.log.error(result.error);
            return reply.code(500).send({
                error: result.error
            })
        } else {
            return reply.send({
                data: {
                    studyset: result.data
                }
            })
        }
    } else {
        return reply.code(401).send({
            error: {
                code: "NOT_AUTHED",
                statusCode: 401,
                message: "Not signed in while trying to create a studyset"
            }
        })
    }
})

fastify.get("/studysets/:studysetid", async function (request, reply) {
    const authContext = await context(request, reply);
    if (authContext.authed) {
        let result = await getStudyset(request.params.studysetid, authContext.authedUser.id);
        if (result.error) {
            request.log.error(result.error);
            return reply.code(500).send({
                error: result.error
            })
        } else if (result.data === null) {
            return reply.callNotFound();
        } else {
            return reply.send({
                data: {
                    studyset: result.data
                }
            })
        }
    } else {
        return reply.code(401).send({
            error: {
                code: "NOT_AUTHED",
                statusCode: 401,
                message: "Not signed in while trying to view a studyset. Use /public/studysets/ for unauthed requests"
            }
        })
    }
})

fastify.put("/studysets/:studysetid", {
    schema: {
        body: {
            type: "object",
            properties: {
                studyset: {
                    type: "object",
                    properties: {
                        title: { type: "string", maxLength: 9000 },
                        private: { type: "boolean" },
                        data: { type: "object" }
                    },
                    required: ["title", "private", "data"]
                }
            },
            required: ["studyset"]
        }
    }
}, async function (request, reply) {
    const authContext = await context(request, reply);
    if (authContext.authed) {
        let result = await updateStudyset(request.params.studysetid, request.body.studyset, authContext.authedUser.id);
        if (result.error) {
            request.log.error(result.error);
            return reply.code(500).send({
                error: result.error
            })
        } else if (result.data === null) {
            return reply.callNotFound();
        } else {
            return reply.send({
                data: {
                    studyset: result.data
                }
            })
        }
    } else {
        return reply.code(401).send({
            error: {
                code: "NOT_AUTHED",
                statusCode: 401,
                message: "Not signed in while trying to update a studyset"
            }
        })
    }
})

fastify.delete("/studysets/:studysetid", async function (request, reply) {
    const authContext = await context(request, reply);
    if (authContext.authed) {
        let result = await deleteStudyset(request.params.studysetid, authContext.authedUser.id);
        if (result.error) {
            request.log.error(result.error);
            return reply.code(500).send({
                error: result.error
            })
        } else if (result.data === null) {
            return reply.callNotFound();
        } else {
            return reply.send({
                data: {
                    studyset: result.data
                }
            })
        }
    } else {
        return reply.code(401).send({
            error: {
                code: "NOT_AUTHED",
                statusCode: 401,
                message: "Not signed in while trying to delete a studyset"
            }
        })
    }
})

fastify.get("/public/studysets/:studysetid", async function (request, reply) {
    let result = await getPublicStudyset(request.params.studysetid);
    if (result.error) {
        request.log.error(result.error);
        return reply.code(500).send({
            error: result.error
        })
    } else if (result.data === null) {
        return reply.callNotFound();
    } else {
        return reply.send({
            data: {
                studyset: result.data
            }
        })
    }
})

fastify.get("/public/search/studysets", {
    schema: {
        querystring: {
            type: "object",
            properties: {
                q: { type: "string", maxLength: 9000 },
                limit: {
                    type: "number",
                    default: 10,
                    minimum: 1,
                    maximum: 9000
                }
            },
            required: ["q"]
        }
    }
}, async function (request, reply) {
    limit = request.query.limit;
    
})

fastify.get("/public/search/queries", {
    schema: {
        querystring: {
            type: "object",
            properties: {
                q: { type: "string", maxLength: 50 },
                limit: {
                    type: "number",
                    default: 5,
                    minimum: 1,
                    maximum: 9000
                }
            },
            required: ["q"]
        }
    }
}, async function (request, reply) {
    let limit = request.query.limit;
    
})

fastify.get("/public/list/recent", {
    schema: {
        querystring: {
            type: "object",
            properties: {
                limit: {
                    type: "number",
                    default: 3,
                    minimum: 1,
                    maximum: 9000
                },
                offset: {
                    type: "number",
                    default: 0,
                    minimum: 0,
                }
            }
        }
    }
}, async function (request, reply) {
    let result = await recentStudysets(request.querystring.limit, request.querystring.offset);
    if (result.error) {
        return reply.code(500).send({
            error: result.error
        })
    } else {
        return reply.send({
            data: {
                studysets: result.data
            }
        })
    }
})

fastify.get("/public/list/featured", {
    schema: {
        querystring: {
            type: "object",
            properties: {
                limit: {
                    type: "number",
                    default: 3,
                    minimum: 1,
                    maximum: 9000
                },
                offset: {
                    type: "number",
                    default: 0,
                    minimum: 0,
                }
            }
        }
    }
}, async function (request, reply) {
    let result = await featuredStudysets(request.querystring.limit, request.querystring.offset);
    if (result.error) {
        return reply.code(500).send({
            error: result.error
        })
    } else {
        return reply.send({
            data: {
                studysets: result.data
            }
        })
    }
})

fastify.get("/list/my-studysets", async function (request, reply) {
    if (
        (
            /* check for Authorization header */
            request.headers.authorization &&
            request.headers.authorization.toLowerCase().startsWith("bearer ")
        ) || (
            /* or check for Auth cookie */
            request.cookies && request.cookies.auth
        )
    ) {
        let limit = 10;
        if (request.query && request.query.limit > 0 && request.query.limit < 200) {
            limit = request.query.limit;
        }
        /*
            "Bearer " (with space) is 6 characters, so 7 is where our token starts
            We're using optional chaining (?.) with an OR (||), so that if the auth header isn't there, it uses the auth cookie
        */
        let authToken = request.headers?.authorization?.substring(7) || request.cookies.auth;
        let client = await pool.connect();
        try {
            await client.query("BEGIN");
            await client.query("set role quizfreely_auth");
            let session = await client.query(
                "select user_id from auth.verify_session($1)",
                [ authToken ]
            );
            if (session.rows.length == 1) {
                await client.query("set role quizfreely_auth_user");
                await client.query("select set_config('quizfreely_auth.user_id', $1, true)", [session.rows[0].user_id]);
                let studysets = await client.query(
                    "select id, user_id, title, private, updated_at from public.studysets " +
                    "where user_id = $1 order by updated_at desc limit $2",
                    [
                        session.rows[0].user_id,
                        limit
                    ]
                );
                await client.query("COMMIT");
                return reply.send({
                    "error": false,
                    "data": {
                        rows: studysets.rows,
                    }
                })
            } else {
                await client.query("ROLLBACK");
                return reply.code(401).send({
                    error: {
                        type: "session-invalid"
                    }
                })
            }
        } catch (error) {
            await client.query("ROLLBACK");
            request.log.error(error);
            return reply.code(500).send({
                error: {
                    type: "db-error"
                }
            })
        } finally {
            client.release()
        }
    } else {
        return reply.code(401).send({
            error: {
                type: "auth-missing"
            }
        })
    }
})

done();
}

fastify.register(routes, {
    prefix: "/v0"
})

fastify.listen({
    port: PORT,
    host: HOST
}, function (error, address) {
    if (error) {
        fastify.log.error(error);
        process.exit(1);
    } else if (LOG_PRETTY == "true") {
        var link = address;
        if (COOKIES_DOMAIN == "localhost") {
            link = link.replace("://[::]:", "://localhost:")
            link = link.replace("://127.0.0.1:", "://localhost:")
        }
        console.log("Quizfreely-API is running at " + link);
    }
})

if (CRON_CLEAR_LOGS == "true") {
    new Cron(CRON_CLEAR_LOGS_INTERVAL, async function () {
        try {
            writeFile(
                path.join(import.meta.dirname, "quizfreely-api.log"),
                "",
                function () {
                    fastify.log.info("ran cron job to clear log file")
                }
            )
        } catch (error) {
            fastify.log.error(error, "error while trying to clear logs with cron job")
        }
    });
}

if (CRON_DELETE_EXPIRED_SESSIONS == "true") {
    new Cron(CRON_DELETE_EXPIRED_SESSIONS_INTERVAL, async function () {
        try {
            let client = await pool.connect();
            try {
                await client.query("BEGIN");
                await client.query("set role quizfreely_auth");
                await client.query("call auth.delete_expired_sessions()");
                await client.query("COMMIT");
                fastify.log.info("ran cron job for auth.delete_expired_sessions()")
            } catch (error2) {
                await client.query("ROLLBACK");
                fastify.log.error(error2, "error while running cron job for auth.delete_expired_sessions()")
            } finally {
                client.release();
            }
        } catch (error) {
            fastify.log.error(error, "error while connecting to pg pool client during cron job for auth.delete_expired_sessions()")
        }
    });
}
