export async function load({ fetch, url }) {
    const cloudIds = url.searchParams.getAll("studyset");
    const localIds = url.searchParams.getAll("localStudyset").map(Number).filter((n) => !Number.isNaN(n));
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
            query = `query loadPracticeTest($cloudIds: [ID!]!) {
                authed
                authedUser {
                    id
                    username
                    displayName
                }
                studysets(ids: $cloudIds) {
                    id
                    title
                    updatedAt
                    user {
                        id
                        displayName
                    }
                    private
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
        if (resp?.data == null) {
            console.log("Error in cloud studyset practice test load func api request. Response: ", resp);
        }
        data = {
            studysets: resp?.data?.studysets,
            authed: resp?.data?.authed,
            authedUser: resp?.data?.authedUser,
        };
    } catch (err) {
        console.error("Error in cloud studyset practice test load func: ", err);
        data = {
          studysetId: params.id,
          authed: false,
        };
    }
    return {
        ...data,
        cloudIds,
        localIds,
    };
}
