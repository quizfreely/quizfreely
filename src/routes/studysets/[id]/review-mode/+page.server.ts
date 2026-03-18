import fetchAuthData from '$lib/auth-data.server'

export async function load({ locals, params}) {
    let userResult = await fetchAuthData({ locals })
    return {
      studysetId: params.id,
      authed: userResult.authed,
      authedUser: userResult?.authedUser
    }
}
