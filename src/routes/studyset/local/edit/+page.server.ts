import fetchAuthData from '$lib/auth-data.server'

export async function load({ locals, url }) {
    let localId = parseInt(url.searchParams.get("id") ?? "");
    let userResult = await fetchAuthData({ locals })
    return {
        localId: localId,
      authed: userResult.authed,
      authedUser: userResult?.authedUser
    }
}
