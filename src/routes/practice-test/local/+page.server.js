import fetchAuthData from '$lib/fetchAuthData.server'

export async function load({ cookies, fetch, url }) {
    let practiceTestId = parseInt(url.searchParams.get("id"));
    let userResult = await fetchAuthData({ fetch });
    return {
      practiceTestId: practiceTestId,
      authed: userResult.authed,
      authedUser: userResult?.authedUser,
      settingsDateTimeFmtHours: cookies.get(
        "settingsdatetimeformathours"
      )
    }
}
