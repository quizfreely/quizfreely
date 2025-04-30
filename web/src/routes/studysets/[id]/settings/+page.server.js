import fetchAuthData from '$lib/fetchAuthData.server'

export async function load({ cookies, params, url }) {
    let userResult = await fetchAuthData({ cookies })
    return {
      studysetId: params.id,
      authed: userResult.authed,
      authedUser: userResult?.authedUser
    }
}
