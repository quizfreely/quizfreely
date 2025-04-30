import fetchAuthData from '$lib/fetchAuthData.server'
import safelyParseLinkSearchParam from '$lib/safelyParseLinkSearchParam.js'

export async function load({ cookies, params, url }) {
    let userResult = await fetchAuthData({ cookies })
    return {
      backLink: safelyParseLinkSearchParam(url.searchParams, "back"),
      studysetId: params.id,
      authed: userResult.authed,
      authedUser: userResult?.authedUser
    }
}
