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
    const localId = parseInt(url.searchParams.get("localId"));
    let respData = {};
    if (studysetId) {
        try {
            const raw = await fetch(env.API_URL+"/graphql", {
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
    }
    return {
        studysetId,
        localId,
        ...respData
    }
}
