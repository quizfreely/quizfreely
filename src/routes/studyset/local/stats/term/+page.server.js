import fetchAuthData from "$lib/fetchAuthData.server";

export async function load({ cookies, url }) {
    let localTermId = parseInt(url.searchParams.get("id"));
    let localStudysetId = parseInt(url.searchParams.get("studysetId"));
    let userResult = await fetchAuthData({ cookies });
    return {
      localTermId: localTermId,
      localStudysetId: localStudysetId,
      authed: userResult.authed,
      authedUser: userResult?.authedUser,
      settingsDateTimeFmtHours: cookies.get(
        "settingsdatetimeformathours"
      )
    }
}
