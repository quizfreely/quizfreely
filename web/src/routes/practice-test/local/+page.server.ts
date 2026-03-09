import fetchAuthData from '$lib/fetchAuthData.server'

export async function load({ cookies, url }) {
    let practiceTestId = parseInt(url.searchParams.get("id"));
    let userResult = await fetchAuthData({ cookies });
    return {
      practiceTestId: practiceTestId,
      authed: userResult.authed,
      authedUser: userResult?.authedUser,
      settingsDateTimeFmtHours: cookies.get(
        "settingsdatetimeformathours"
      )
    }
}
