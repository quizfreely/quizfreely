import { env } from '$env/dynamic/public';

export async function load({ cookies, url }) {
    try {
        const pageNum = url.searchParams.get("page") ?? 0;
        const recentlyUpdated = url.searchParams.has("updated");
        let rawApiRes = await fetch(env.API_URL + "/graphql", {
          method: "POST",
          headers: {
            "Authorization": "Bearer " + cookies.get("auth"),
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            query: `query ($offset: Int) {
              authed
              authedUser {
                id
                username
                displayName
                authType
                oauthGoogleEmail
                modPerms
              }
              recently${recentlyUpdated ? "Updated" : "Created"}Studysets(
                limit: 24,
                offset: $offset
              ) {
                id
                title
                user {
                    displayName
                }
                termsCount
                updatedAt
              }
            }`,
            variables: {
              offset: pageNum * 24
            }
          })
        });
        let apiRes = await rawApiRes.json();
        let authed = false;
        let authedUser;
        if (apiRes?.data?.authed) {
          authed = apiRes.data.authed;
          authedUser = apiRes.data?.authedUser;
        }
        
        return {
            recentlyCreatedStudysets: apiRes?.data?.recentlyCreatedStudysets,
            recentlyUpdatedStudysets: apiRes?.data?.recentlyUpdatedStudysets,
            authed: authed,
            authedUser: authedUser,
            header: {
                activePage: "explore"
            },
            pageNum
        }
      } catch (err) {
        console.error(err);
        return {
            authed: false,
            header: {
                activePage: "explore"
            },
            pageNum
        }
      }
}
