import { error } from '@sveltejs/kit';

export async function load({ fetch, url }) {
    const cloudIds = url.searchParams.getAll("studyset");
    const localIds = url.searchParams.getAll("localStudyset").map(
        id => (id == "" || isNaN(id)) ?
            undefined : Number(id)
    ).filter(n => n != null);
    if (cloudIds.length + localIds.length == 0) {
        error(404, {
            message: "Not Found"
        });
        return;
    }
    let data;
    try {
        let variables;
        let query = `{
            authed
            authedUser {
                id
                username
                displayName
            }
        }`;
        if (cloudIds.length > 0) {
            query = `query studysetMatch($cloudIds: [ID!]!) {
                authed
                authedUser {
                    id
                    username
                    displayName
                }
                studysets(ids: $cloudIds) {
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
            }`;
            variables = {
                cloudIds,
            };
        }
        let rawApiRes = await fetch("/api/graphql", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query,
                variables,
            })
        });
        let apiRes = await rawApiRes.json();
        let authed = false;
        let authedUser;
        if (apiRes?.data?.authed) {
            authed = apiRes.data.authed;
            authedUser = apiRes.data?.authedUser;
        }
        if (apiRes?.data) {
            data = {
                studysets: apiRes.data.studysets,
                authed: authed,
                authedUser: authedUser,
            };
        } else {
            console.error(
                "API Error in match page load func: ",
                apiRes,
            );
            error(404, {
                message: "Not Found",
            });
        }
    } catch (err) {
        console.error(
            "Error in match page load func: ",
            err,
        );
        error(404, {
            message: "Not Found",
        });
    }
    return {
        ...data,
        cloudIds,
        localIds,
        header: {
            hideHeader: true
        }
    };
}
