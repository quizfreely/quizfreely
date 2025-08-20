import fetchAuthData from '$lib/fetchAuthData.server'

export async function load({ cookies, params}) {

    return {
      studysetId: params.id,
      authed: authed,
      authedUser: userResult?.authedUser
    }
}
