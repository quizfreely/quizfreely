import { env } from "$env/dynamic/public";
import { error } from '@sveltejs/kit';

export async function load({ params, cookies }) {
    let headers = {
        "Content-Type": "application/json"
    };
    if (cookies.get("auth")) {
        headers = {
            "Authorization": "Bearer " + cookies.get("auth"),
            "Content-Type": "application/json"
        };
    }
    try {
        let rawApiRes = await fetch(env.API_URL + "/graphql", {
            method: "POST",
            headers: headers,
            body: JSON.stringify({
                query: `query studysetMatch($id: ID!) {
                    authed
                    authedUser {
                        id
                        username
                        displayName
                    }
                    studyset(id: $id) {
                        terms {
                            id
                            term
                            def
                            termImageUrl
                            defImageUrl
                        }
                    }
                }`,
                variables: {
                    id: params.id
                }
            })
        });
        let apiRes = await rawApiRes.json();
        let authed = false;
            let authedUser;
            if (apiRes?.data?.authed) {
                authed = apiRes.data.authed;
                authedUser = apiRes.data?.authedUser;
            }
            if (apiRes?.data?.studyset) {
                return {
                    terms: apiRes.data.studyset.terms,
                    cloudId: params.id,
                    authed: authed,
                    authedUser: authedUser,
                    header: {
                        hideHeader: true
                    }
                };
            } else {
                console.error(
                    "API Error in match page load func: ",
                    apiRes
                );
                error(404, {
                    message: "Not Found"
                })
            }
    } catch (err) {
        console.error(
            "Error in match page load func: ",
            err
        );
        error(404, {
            message: "Not Found"
        })
    }
}
