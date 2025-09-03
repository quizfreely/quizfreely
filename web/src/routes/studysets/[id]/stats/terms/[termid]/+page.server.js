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
                query: `query termStats($termId: ID!) {
    authed
    authedUser {
        id
        username
        displayName
    }
    term(id: $termId) {
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
        progressHistory {
            timestamp
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
}`,
                variables: {
                    termId: params.termid
                }
            })
        });
        const resp = await respRaw.json();
        if (resp?.data == null || resp?.errors != null) {
            console.log("Error in cloud studyset stats load func api request. Response: ", resp);
        }
        return {
            studysetId: params.id,
            termId: params.termid,
            term: resp?.data?.term,
            authed: resp?.data?.authed,
            authedUser: resp?.data?.authedUser,
            settingsDateTimeFmtHours: cookies.get(
              "settingsdatetimeformathours"
            )
        }
    } catch (err) {
        console.error("Error in cloud term stats load func: ", err);
        return {
          studysetId: params.id,
          termId: params.termid,
          authed: false,
          settingsDateTimeFmtHours: cookies.get(
            "settingsdatetimeformathours"
          )
        }
    }
}
