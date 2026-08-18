import fetchAuthData from '$lib/fetchAuthData.server'

export async function load({ fetch, url }) {
    let userResult = await fetchAuthData({ fetch })
    return {
      authed: userResult.authed,
      authedUser: userResult?.authedUser,
      folderId: url.searchParams.get("folderId")
    }
}
