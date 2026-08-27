import { error } from '@sveltejs/kit';

export async function load({ fetch, url }) {
    const cloudTermId = url.searchParams.get("term");
    let localTermId = url.searchParams.get("term");
    localTermId = (localTermId != null && !isNaN(localTermId)) ?
        Number(localTermId) : undefined;
    if (cloudTermId == null && localTermId == null) {
        error(404, {
            message: "Not Found"
        });
        return;
    }
    const cloudStudysetIds = url.searchParams.getAll("studyset");
    const localStudysetIds = url.searchParams.getAll("localStudyset").map(Number).filter((n) => !Number.isNaN(n));
    if (cloudStudysetIds.length + localStudysetIds.length == 0) {
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
        if (cloudTermId) {
            variables = {
                cloudTermId,
            };
            query = `query termStats($cloudTermId: ID!) {
                authed
                authedUser {
                    id
                    username
                    displayName
                }
                term(id: $cloudTermId) {
                    id
                    term
                    def
                    termImageUrl
                    defImageUrl
                    progress {
                        termFirstReviewedAt
                        termLastReviewedAt
                        termReviewCount
                        defFirstReviewedAt
                        defLastReviewedAt
                        defReviewCount
                        termCorrectCount
                        termIncorrectCount
                        defCorrectCount
                        defIncorrectCount
                    }
                    reviewEventStatsByDay(last: 30) {
                        timestamp
                        correct
                        incorrect
                    }
                }
            }`;
        }
        const respRaw = await fetch("/api/graphql", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                query,
                variables,
            }),
        });
        const resp = await respRaw.json();
        if (resp?.data == null || resp?.errors != null) {
            console.log("Error in term stats load func api request. Response: ", resp);
        }
        data = {
            term: resp?.data?.term,
            authed: resp?.data?.authed,
            authedUser: resp?.data?.authedUser,
        };
    } catch (err) {
        console.error("Error in term stats load func: ", err);
        data = {
            authed: false,
        };
    }
    return {
        ...data,
        cloudTermId,
        localTermId,
        cloudStudysetIds,
        localStudysetIds,
    };
}
