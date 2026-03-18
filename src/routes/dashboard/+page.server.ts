import { env } from '$env/dynamic/public';

export async function load({ cookies, locals, url }) {
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
  const settingsDateTimeFormatHours = cookies.get("settingsdatetimeformathours");
  if (settingsDateTimeFormatHours) {
    cookies.set(
      "settingsdatetimeformathours",
      settingsDateTimeFormatHours,
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
  const folderId = url?.searchParams?.get("folder");
  if (cookies.get("auth")) {
    try {
      const data = await locals.sdk.DashboardPage();
      if (data.authed) {
        const myStudysets = data.myStudysets?.edges?.map((e: any) => e.node) ?? [];
        const mySavedStudysets = data.mySavedStudysets?.edges?.map((e: any) => e.node) ?? [];
        const myFolders = data.myFolders?.edges?.map((e: any) => e.node) ?? [];
        return {
          dashboardPage: "dashboard",
          authed: data.authed,
          authedUser: data.authedUser,
          studysetList: myStudysets,
          studysetListPageInfo: data.myStudysets?.pageInfo,
          mySavedStudysets,
          mySavedStudysetsPageInfo: data.mySavedStudysets?.pageInfo,
          myFolders,
          myFoldersPageInfo: data.myFolders?.pageInfo,
          header: { activePage: "home" },
          settingsDateTimeFormatHours: cookies.get(
            "settingsdatetimeformathours"
          ),
          folderId
        };
      } else {
        return {
          dashboardPage: "dashboard",
          authed: false,
          header: { activePage: "home" },
          settingsDateTimeFormatHours: cookies.get(
            "settingsdatetimeformathours"
          ),
          folderId
        };
      }
    } catch (error) {
      console.error("Error in dashboard page load func: ", error);
      return {
        dashboardPage: "dashboard",
        authed: false,
        header: { activePage: "home" },
        settingsDateTimeFormatHours: cookies.get(
          "settingsdatetimeformathours"
        ),
        folderId
      };
    }
  } else {
    return {
      dashboardPage: "dashboard",
      authed: false,
      header: { activePage: "home" },
      settingsDateTimeFormatHours: cookies.get(
        "settingsdatetimeformathours"
      ),
      folderId
    }
  }
};
