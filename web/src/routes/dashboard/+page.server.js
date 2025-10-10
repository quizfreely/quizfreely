import { env } from '$env/dynamic/public';

export async function load({ cookies, locals }) {
  /*
    cookies are not permanent, they eventually expire
    resetting the expiration date on every page doesn't make sense
    instead we refresh/update the expiration date when users visit the dashboard
  */
  cookies.set(
    "theme",
    locals.theme,
    {
      /* 30 days * 24h * 60m * 60s = 2592000 sec for 30 days */
      maxAge: 2592000,
      path: "/",
      httpOnly: true,
      /* when secure is true,
      browsers only send the cookie through https,
      on localhost, browsers send it even if localhost isn't using https */
      secure: true,
      sameSite: "lax"
    }
  );
    if (cookies.get("settingsdatetimeformathours")) {
        cookies.set(
          "settingsdatetimeformathours",
          cookies.get("settingsdatetimeformathours"),
          {
            /* 30 days * 24h * 60m * 60s = 2592000 sec for 30 days */
            maxAge: 2592000,
            path: "/",
            httpOnly: true,
            /* when secure is true,
            browsers only send the cookie through https,
            on localhost, browsers send it even if localhost isn't using https */
            secure: true,
            sameSite: "lax"
          }
        );
    }
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
            folder {
                id
                name
            }
          }
          mySavedStudysets {
            id
            title
            private
            termsCount
            updatedAt
            folder {
                id
                name
            }
          }
        }`
      })
    });
    try {
    let apiRes = await rawApiRes.json();
        if (apiRes?.data?.authed) {
            return {
              dashboardPage: "dashboard",
              authed: apiRes.data.authed,
              authedUser: apiRes.data.authedUser,
              studysetList: apiRes.data.myStudysets,
              mySavedStudysets: apiRes.data.mySavedStudysets,
        header: { activePage: "home" },
              settingsDateTimeFormatHours: cookies.get(
                "settingsdatetimeformathours"
              )
            }
        } else {
          return {
              dashboardPage: "dashboard",
            authed: false,
      header: { activePage: "home" },
              settingsDateTimeFormatHours: cookies.get(
                "settingsdatetimeformathours"
              )
          }
        }
      } catch (error) {
        //request.log.error(error);
        //reply.send("work in progress error message error during api response json parse")
        return {
              dashboardPage: "dashboard",
          authed: false,
      header: { activePage: "home" },
              settingsDateTimeFormatHours: cookies.get(
                "settingsdatetimeformathours"
              )
        }
      }
    } catch (error) {
      //request.log.error(error);
      //reply.send("work in progress error message error during api graphql fetch")
      // in addition to an error message, our dashboard.html view should still be sent so that stuff like local studysets are still usable
      return {
              dashboardPage: "dashboard",
        authed: false,
      header: { activePage: "home" },
              settingsDateTimeFormatHours: cookies.get(
                "settingsdatetimeformathours"
              )
      }
    }
  } else {
    return {
              dashboardPage: "dashboard",
      authed: false,
      header: { activePage: "home" },
              settingsDateTimeFormatHours: cookies.get(
                "settingsdatetimeformathours"
              )
    }
  }
};
