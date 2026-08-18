import { error } from '@sveltejs/kit';

export async function load({ params, fetch }) {
    try {
        let rawApiRes = await fetch("/api/graphql", {
            method: "POST",
            headers: {
        "Content-Type": "application/json"
    },
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
                        matchActivities {
                            id
                            durationMs
                            endTimestamp
                            termIds
                            incorrectPairIds
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
                    pastMatchActivities: apiRes.data.studyset.matchActivities,
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
