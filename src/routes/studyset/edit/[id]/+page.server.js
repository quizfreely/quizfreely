import fetchAuthData from '$lib/fetchAuthData.server'

export async function load({ cookies, params, url }) {
    let userResult = await fetchAuthData({ cookies })
    return {
      authed: userResult.authed,
      authedUser: userResult?.authedUser,
      studysetId: params.id,
      initShowImport: url.searchParams.has("import")
    }
}
