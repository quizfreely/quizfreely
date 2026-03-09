import { env } from '$env/dynamic/public';

export async function load({ cookies, locals }) {
  if (cookies.get("auth")) {
    try {
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
          }
          myStudysets(first: 500, hideFoldered: true) {
            edges { node { id title private termsCount updatedAt } }
            pageInfo { hasNextPage endCursor }
          }
          myFolders(first: 500) {
            edges { node { id name } }
            pageInfo { hasNextPage endCursor }
          }
          mySavedStudysets(first: 500) {
            edges { node { id title private termsCount updatedAt } }
            pageInfo { hasNextPage endCursor }
          }
        }`
      })
    });
    try {
    let apiRes = await rawApiRes.json();
        if (apiRes?.data?.authed) {
            const studysetList = apiRes.data.myStudysets?.edges?.map((e) => e.node) ?? [];
            const myFolders = apiRes.data.myFolders?.edges?.map((e) => e.node) ?? [];
            const mySavedStudysets = apiRes.data.mySavedStudysets?.edges?.map((e) => e.node) ?? [];
            return {
              authed: apiRes.data.authed,
              authedUser: apiRes.data.authedUser,
              studysetList,
              myFolders,
              mySavedStudysets,
              settingsDateTimeFormatHours: cookies.get(
                "settingsdatetimeformathours"
              )
            }
        } else {
          return {
            authed: false,
              settingsDateTimeFormatHours: cookies.get(
                "settingsdatetimeformathours"
              )
          }
        }
      } catch (error) {
        return {
          authed: false,
              settingsDateTimeFormatHours: cookies.get(
                "settingsdatetimeformathours"
              )
        }
      }
    } catch (error) {
      return {
        authed: false,
              settingsDateTimeFormatHours: cookies.get(
                "settingsdatetimeformathours"
              )
      }
    }
  } else {
    return {
      authed: false,
              settingsDateTimeFormatHours: cookies.get(
                "settingsdatetimeformathours"
              )
    }
  }
};
