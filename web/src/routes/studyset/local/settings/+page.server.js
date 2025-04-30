import fetchAuthData from '$lib/fetchAuthData.server'
import safelyParseLinkSearchParam from '$lib/safelyParseLinkSearchParam.js';

export async function load({ cookies, url }) {
    let localId = parseInt(url.searchParams.get("id"));
    let userResult = await fetchAuthData({ cookies });
    return {
      backLink: safelyParseLinkSearchParam(url.searchParams, "back"),
      localId: localId,
      authed: userResult.authed,
      authedUser: userResult?.authedUser
    }
}
