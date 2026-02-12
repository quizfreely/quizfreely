import { env } from '$env/dynamic/public';

export async function load({ cookies, url }) {
  const PER_PAGE = 24;
  const recentlyUpdated = url.searchParams.has("updated");
  try {
    const after = url.searchParams.get("after");
    const before = url.searchParams.get("before");
    let rawApiRes = await fetch(env.API_URL + "/graphql", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + cookies.get("auth"),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query: `query($after: String, $before: String) {
              authed
              authedUser {
                id
                username
                displayName
                authType
                oauthGoogleEmail
                modPerms
              }
              recentlyCreatedStudysets(first: ${PER_PAGE}, after: $after, before: $before) {
                edges { node { id title user { displayName } termsCount updatedAt } }
                pageInfo { hasNextPage hasPreviousPage startCursor endCursor }
              }
              recentlyUpdatedStudysets(first: ${PER_PAGE}, after: $after, before: $before) {
                edges { node { id title user { displayName } termsCount updatedAt } }
                pageInfo { hasNextPage hasPreviousPage startCursor endCursor }
              }
            }`,
        variables: {
          after,
          before
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
    const createdConn = apiRes?.data?.recentlyCreatedStudysets;
    const updatedConn = apiRes?.data?.recentlyUpdatedStudysets;
    return {
      explorePage: recentlyUpdated ? "recently-updated" : "recently-created",
      recentlyCreatedStudysets: createdConn?.edges?.map((e) => e.node) ?? [],
      recentlyUpdatedStudysets: updatedConn?.edges?.map((e) => e.node) ?? [],
      pageInfo: recentlyUpdated ? updatedConn?.pageInfo : createdConn?.pageInfo,
      recentlyUpdated,
      authed: authed,
      authedUser: authedUser,
      header: {
        activePage: "explore"
      },
      PER_PAGE
    }
  } catch (err) {
    console.error(err);
    return {
      explorePage: recentlyUpdated ? "recently-updated" : "recently-created",
      authed: false,
      header: {
        activePage: "explore"
      },
      recentlyCreatedStudysets: [],
      recentlyUpdatedStudysets: [],
      recentlyUpdated,
      PER_PAGE
    }
  }
}
