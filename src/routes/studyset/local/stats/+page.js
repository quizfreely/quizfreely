import fetchAuthData from "$lib/fetchAuthData.js";

export async function load({ fetch, url }) {
    let localId = parseInt(url.searchParams.get("id"));
    let userResult = await fetchAuthData({ fetch });
    return {
      localId: localId,
      authed: userResult.authed,
      authedUser: userResult?.authedUser,
    }
}
