import { env } from '$env/dynamic/public';

export async function load({ cookies, url }) {
  const PER_PAGE = 24;
  const recentlyUpdated = url.searchParams.has("updated");
  try {
    const after = url.searchParams.get("after");
    const before = url.searchParams.get("before");

    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()).toISOString();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    let rawApiRes = await fetch(env.API_URL + "/graphql", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + cookies.get("auth"),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query: `query($after: String, $before: String, $day: String, $week: String, $month: String) {
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
              countDay: ${recentlyUpdated ? 'studysetUpdateCount' : 'studysetCount'}(after: $day, includePrivate: true)
              countWeek: ${recentlyUpdated ? 'studysetUpdateCount' : 'studysetCount'}(after: $week, includePrivate: true)
              countMonth: ${recentlyUpdated ? 'studysetUpdateCount' : 'studysetCount'}(after: $month, includePrivate: true)
              countTotal: ${recentlyUpdated ? 'studysetUpdateCount' : 'studysetCount'}(includePrivate: true)
            }`,
        variables: {
          after,
          before,
          day: dayStart,
          week: weekStart,
          month: monthStart
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

    let totalCount = apiRes?.data?.countTotal ?? 0;
    let newCount = apiRes?.data?.countDay ?? 0;
    let newPeriod = "today";
    if ((newCount <= 0 && apiRes?.data?.countWeek >= 1) || (newCount <= 2 && apiRes?.data?.countWeek > 3) || (newCount < 10 && apiRes?.data?.countWeek >= 10)) {
      newCount = apiRes?.data?.countWeek ?? 0;
      newPeriod = "this week";
    }
    if (newCount < 10 && apiRes?.data?.countMonth >= 10) {
      newCount = apiRes?.data?.countMonth ?? 0;
      newPeriod = "this month";
    }

    return {
      explorePage: recentlyUpdated ? "recently-updated" : "recently-created",
      recentlyCreatedStudysets: createdConn?.edges?.map((e) => e.node) ?? [],
      recentlyUpdatedStudysets: updatedConn?.edges?.map((e) => e.node) ?? [],
      pageInfo: recentlyUpdated ? updatedConn?.pageInfo : createdConn?.pageInfo,
      recentlyUpdated,
      newCount,
      newPeriod,
      totalCount,
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
