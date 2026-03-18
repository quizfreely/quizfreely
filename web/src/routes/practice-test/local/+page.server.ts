import fetchAuthData from '$lib/auth-data.server'

export async function load({ locals, url, cookies }) {
    let practiceTestId = parseInt(url.searchParams.get("id") ?? "");
    let userResult = await fetchAuthData({ locals });
    return {
      practiceTestId: practiceTestId,
      authed: userResult.authed,
      authedUser: userResult?.authedUser,
      settingsDateTimeFmtHours: cookies.get(
        "settingsdatetimeformathours"
      )
    }
}
