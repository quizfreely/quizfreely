import fetchAuthData from '$lib/auth-data.server'

export async function load({ cookies, params }) {
    let userResult = await fetchAuthData({ cookies })
    return {
      authed: userResult.authed,
      authedUser: userResult?.authedUser,
      studysetId: params.id
    }
}
