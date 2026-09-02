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
            variables = {
                cloudIds,
            };
            query = `query studysetStats($cloudIds: [ID!]!) {
                authed
                authedUser {
                    id
                    username
                    displayName
                }
                studysets(ids: $cloudIds) {
                    id
                    title
                    terms {
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
                    }
                    practiceTests {
                        id
                        timestamp
                        questionsCorrect
                        questionsTotal
                    }
                    reviewEventStatsByDay(lastDaysTotal: 30) {
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
            })
        });
        const resp = await respRaw.json();
        if (resp?.data == null || resp?.errors != null) {
            console.log("Error in cloud studyset stats load func api request. Response: ", resp);
        }
        data = {
            studysets: resp?.data?.studysets,
            authed: resp?.data?.authed,
            authedUser: resp?.data?.authedUser,
        };
    } catch (err) {
        console.error("Error in cloud studyset stats load func: ", err);
        data = {
          authed: false,
        };
    }
    return {
        ...data,
        cloudIds,
        localIds,
    };
}
