import fetchAuthData from '$lib/fetchAuthData.server'

export async function load({ fetch, url }) {
    let localId = parseInt(url.searchParams.get("id"));
    let userResult = await fetchAuthData({ fetch });
    return {
        localId: localId,
        authed: userResult.authed,
        authedUser: userResult?.authedUser,
        header: {
            hideHeader: true
        }
    }
}
