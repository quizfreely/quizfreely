export async function load({ cookies, params, fetch }) {
    try {
        const respRaw = await fetch("/api/graphql", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                query: `query studysetStats($studysetId: ID!) {
    authed
    authedUser {
        id
        username
        displayName
    }
    studyset(id: $studysetId) {
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
        reviewEventStatsByDay(last: 30) {
            timestamp
            correct
            incorrect
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
            console.log("Error in cloud studyset stats load func api request. Response: ", resp);
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
        console.error("Error in cloud studyset stats load func: ", err);
        return {
          studysetId: params.id,
          authed: false,
          settingsDateTimeFmtHours: cookies.get(
            "settingsdatetimeformathours"
          )
        }
    }
}
