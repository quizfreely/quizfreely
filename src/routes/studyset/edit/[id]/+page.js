import fetchAuthData from '$lib/fetchAuthData.js'

export async function load({ fetch, params, url }) {
    let userResult = await fetchAuthData({ fetch })
    return {
      authed: userResult.authed,
      authedUser: userResult?.authedUser,
      studysetId: params.id,
      initShowImport: url.searchParams.has("import")
    }
}
