import { env } from '$env/dynamic/public';

export async function load({ cookies, url }) {
    try {
        const PER_PAGE = 24;
        const pageNum = 1; // first page only until client-side pagination
        const recentlyUpdated = url.searchParams.has("updated");
        let rawApiRes = await fetch(env.API_URL + "/graphql", {
          method: "POST",
          headers: {
            "Authorization": "Bearer " + cookies.get("auth"),
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            query: `query {
              authed
              authedUser {
                id
                username
                displayName
                authType
                oauthGoogleEmail
                modPerms
              }
              recentlyCreatedStudysets(first: ${PER_PAGE}) {
                edges { node { id title user { displayName } termsCount updatedAt } }
                pageInfo { hasNextPage endCursor }
              }
              recentlyUpdatedStudysets(first: ${PER_PAGE}) {
                edges { node { id title user { displayName } termsCount updatedAt } }
                pageInfo { hasNextPage endCursor }
              }
            }`,
            variables: {}
          })
        });
        let apiRes = await rawApiRes.json();
        let authed = false;
        let authedUser;
        if (apiRes?.data?.authed) {
          authed = apiRes.data.authed;
          authedUser = apiRes.data?.authedUser;
        }
        const createdConn = apiRes?.data?.recentlyCreatedStudysets;
        const updatedConn = apiRes?.data?.recentlyUpdatedStudysets;
        return {
            recentlyCreatedStudysets: createdConn?.edges?.map((e) => e.node) ?? [],
            recentlyUpdatedStudysets: updatedConn?.edges?.map((e) => e.node) ?? [],
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
            recentlyCreatedStudysets: [],
            recentlyUpdatedStudysets: [],
            recentlyUpdated,
            pageNum,
            PER_PAGE
        }
      }
}
