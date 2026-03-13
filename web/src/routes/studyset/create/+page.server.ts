import fetchAuthData from '$lib/auth-data.server'

export async function load({ cookies, url }) {
    let userResult = await fetchAuthData({ cookies })
    return {
      authed: userResult.authed,
      authedUser: userResult?.authedUser,
      folderId: url.searchParams.get("folderId")
    }
}
