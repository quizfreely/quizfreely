import fetchAuthData from '$lib/fetchAuthData.js'

export async function load({ fetch, url }) {
    let practiceTestId = parseInt(url.searchParams.get("id"));
    let userResult = await fetchAuthData({ fetch });
    return {
      practiceTestId: practiceTestId,
      authed: userResult.authed,
      authedUser: userResult?.authedUser,
    }
}
