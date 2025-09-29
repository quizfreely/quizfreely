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
          myStudysets {
            id
            title
            private
            termsCount
            updatedAt
          }
        }`
      })
    });
    try {
    let apiRes = await rawApiRes.json();
        if (apiRes?.data?.authed) {
            return {
              authed: apiRes.data.authed,
              authedUser: apiRes.data.authedUser,
              studysetList: apiRes.data.myStudysets,
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
