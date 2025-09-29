import { env } from "$env/dynamic/public";

export async function load({ url, cookies }) {
    let headers = {
        "Content-Type": "application/json"
      };
      if (cookies.get("auth")) {
        headers = {
          "Authorization": "Bearer " + cookies.get("auth"),
          "Content-Type": "application/json"
        };
      }
    const studysetId = url.searchParams.get("studysetId");
    const localId = parseInt(url.searchParams.get("studysetId"));
    let respData = {};
    if (studysetId) {
        try {
            const raw = await fetch(env.API_URL+"/graphql", {
                method: "POST",
                headers: headers,
                body: JSON.stringify({
                    query: `query hostPlayReviewGame($id: ID!) {
    authed
    authedUser {
        id
        username
        displayName
    }
    studyset(id: $id) {
        id
        termsCount
        terms {
            id
            term
            def
        }
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
            console.error("Error in /host/play load func: ", err);
        }
    }
    return {
        header: {
            hideHeader: true
        },
        studysetId: url.searchParams.get("studysetId"),
        localId: parseInt(url.searchParams.get("studysetId")),
        ...respData
    }
}
