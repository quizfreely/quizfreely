import { env } from "$env/dynamic/private";

export async function load({ cookies, params}) {
    try {
        const respRaw = await fetch(env.API_URL + "/graphql", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${cookies.get("auth")}`
            },
            body: JSON.stringify({
                query: `query loadPracticeTest($studysetId: ID!) {
    authed
    authedUser {
        id
        username
        displayName
    }
    studyset(id: $studysetId) {
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
            topConfusionPairs {
                confusedTerm {
                    id
                    term
                    def
                }
                answeredWith
                confusedCount
            }
            topReverseConfusionPairs {
                term {
                    id
                    term
                    def
                }
                answeredWith
                confusedCount
            }
        }
        practiceTests {
            id
            timestamp
            questionsCorrect
            questionsTotal
        }
    }
}`,
                variables: {
                    studysetId: params.id
                }
            })
        });
        const resp = await respRaw.json();
        if (resp?.data == null || resp?.errors != null) {
            console.log("Error in cloud studyset practice test load func api request. Response: ", resp);
        }
        return {
            studysetId: params.id,
            studyset: resp?.data?.studyset,
            authed: resp?.data?.authed,
            authedUser: resp?.data?.authedUser,
            settingsDateTimeFmtHours: cookies.get(
              "settingsdatetimeformathours"
            )
        }
    } catch (err) {
        console.error("Error in cloud studyset practice test load func: ", err);
        return {
          studysetId: params.id,
          authed: false,
          settingsDateTimeFmtHours: cookies.get(
            "settingsdatetimeformathours"
          )
        }
    }
}
