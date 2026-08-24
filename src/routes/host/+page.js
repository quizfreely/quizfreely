export async function load({ url, fetch }) {
    const headers = {
        "Content-Type": "application/json"
      };
    const studysetId = url.searchParams.get("studysetId");
    let localId = parseInt(url.searchParams.get("localId"));
    if (isNaN(localId)) {
        localId = null;
    }
    let respData = {};
    if (studysetId) {
        try {
            const raw = await fetch("/api/graphql", {
                method: "POST",
                headers: headers,
                body: JSON.stringify({
                    query: `query hostStartReviewGame($id: ID!) {
    authed
    authedUser {
        id
        username
        displayName
    }
    studyset(id: $id) {
        id
        title
        termsCount
    }
}`,
                    variables: {
                      id: studysetId
                    }
                })
            });
            const resp = await raw.json();
            respData = resp?.data;
        } catch (err) {
            console.error("Error in /host load func: ", err);
        }
    } else {
        try {
            const raw = await fetch("/api/graphql", {
                method: "POST",
                headers: headers,
                body: JSON.stringify({
                    query: `{
    authed
    authedUser {
        id
        username
        displayName
    }
}`,
                })
            });
            const resp = await raw.json();
            respData = resp?.data;
        } catch (err) {
            console.error("Error in /host load func: ", err);
        }
    }
    return {
        studysetId,
        localId,
        ...respData
    }
}
