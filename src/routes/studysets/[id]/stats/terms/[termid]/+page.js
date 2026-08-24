export async function load({ params, fetch }) {
    try {
        const respRaw = await fetch("/api/graphql", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
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
}`,
                variables: {
                    termId: params.termid
                }
            })
        });
        const resp = await respRaw.json();
        if (resp?.data == null || resp?.errors != null) {
            console.log("Error in cloud term stats load func api request. Response: ", resp);
        }
        return {
            studysetId: params.id,
            termId: params.termid,
            term: resp?.data?.term,
            authed: resp?.data?.authed,
            authedUser: resp?.data?.authedUser,
        }
    } catch (err) {
        console.error("Error in cloud term stats load func: ", err);
        return {
          studysetId: params.id,
          termId: params.termid,
          authed: false,
        }
    }
}
