import fetchAuthData from '$lib/fetchAuthData.js'

export async function load({ fetch, params}) {
    let userResult = await fetchAuthData({ fetch })
    return {
      studysetId: params.id,
      authed: userResult.authed,
      authedUser: userResult?.authedUser
    }
}
