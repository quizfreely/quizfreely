import fetchAuthData from '$lib/fetchAuthData.js'

export async function load({ cookies, fetch, url }) {
    let localId = parseInt(url.searchParams.get("id"));
    let userResult = await fetchAuthData({ fetch });
    return {
      localId: localId,
      authed: userResult.authed,
      authedUser: userResult?.authedUser,
      settingsDateTimeFmtHours: cookies.get(
        "settingsdatetimeformathours"
      )
    }
}
