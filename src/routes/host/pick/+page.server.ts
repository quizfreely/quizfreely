export async function load({ cookies, locals }) {
  if (cookies.get("auth")) {
    try {
      const { data } = await locals.sdk.HostPickPage();
      if (data.authed) {
        const studysetList = data.myStudysets?.edges?.map((e: any) => e.node) ?? [];
        const myFolders = data.myFolders?.edges?.map((e: any) => e.node) ?? [];
        const mySavedStudysets = data.mySavedStudysets?.edges?.map((e: any) => e.node) ?? [];
        return {
          authed: data.authed,
          authedUser: data.authedUser,
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
      console.error("Error in host/pick page load func: ", error);
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
