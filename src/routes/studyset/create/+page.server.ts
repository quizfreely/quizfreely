import fetchAuthData from '$lib/auth-data.server'

export async function load({ locals, url }) {
    let userResult = await fetchAuthData({ locals })
    return {
      authed: userResult.authed,
      authedUser: userResult?.authedUser,
      folderId: url.searchParams.get("folderId")
    }
}
