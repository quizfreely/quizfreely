import fetchAuthData from '$lib/fetchAuthData.js'

export async function load({ fetch, url }) {
    let localId = parseInt(url.searchParams.get("id"));
    let userResult = await fetchAuthData({ fetch });
    return {
      localId: localId,
      authed: userResult.authed,
      authedUser: userResult?.authedUser,
    }
}


export async function load({ params, fetch }) {
    try {
        const respRaw = await fetch("/api/graphql", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
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
        }
    } catch (err) {
        console.error("Error in cloud studyset practice test load func: ", err);
        return {
          studysetId: params.id,
          authed: false,
        }
    }
}
