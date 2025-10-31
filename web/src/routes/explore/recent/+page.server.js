import { env } from '$env/dynamic/public';

export async function load({ cookies, url }) {
    try {
        const PER_PAGE = 24;
        const pageNum = url.searchParams.get("page") ?? 1;
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
                limit: ${PER_PAGE},
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
              offset: (pageNum - 1) * PER_PAGE
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
            recentlyUpdated,
            authed: authed,
            authedUser: authedUser,
            header: {
                activePage: "explore"
            },
            pageNum,
            PER_PAGE
        }
      } catch (err) {
        console.error(err);
        return {
            authed: false,
            header: {
                activePage: "explore"
            },
            recentlyUpdated,
            pageNum,
            PER_PAGE
        }
      }
}
