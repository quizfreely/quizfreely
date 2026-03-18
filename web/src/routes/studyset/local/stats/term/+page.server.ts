import fetchAuthData from "$lib/auth-data.server";

export async function load({ locals, url, cookies }) {
    let localTermId = parseInt(url.searchParams.get("id") ?? "");
    let localStudysetId = parseInt(url.searchParams.get("studysetId") ?? "");
    let userResult = await fetchAuthData({ locals });
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
