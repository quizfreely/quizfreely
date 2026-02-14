import { env } from '$env/dynamic/public';
import { error, redirect } from '@sveltejs/kit';
import fetchAuthData from '$lib/fetchAuthData.server';

export async function load({ cookies, url }) {
  let searchQuery = (url.searchParams.get("q") ?? "")
  if (searchQuery.replace(/\s+/g, '') == "") {
    searchQuery = "";
  }

  if (searchQuery.length >= 1) {
    try {
      const PER_PAGE = 24;
      const after = url.searchParams.get("after");
      const before = url.searchParams.get("before");
      let rawApiRes = await fetch(env.API_URL + "/graphql", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + cookies.get("auth"),
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          query: `query SearchResults($q: String!, $first: Int, $after: String, $last: Int, $before: String) {
            authed
            authedUser {
              id
              username
              displayName
              authType
              oauthGoogleEmail
            }
            searchStudysets(q: $q, first: $first, after: $after, last: $last, before: $before) {
              edges { node { id title user { id displayName } termsCount } }
              pageInfo { hasNextPage hasPreviousPage startCursor endCursor }
            }
          }`,
          variables: {
            q: url.searchParams.get("q"),
            first: before ? null : PER_PAGE,
            last: before ? PER_PAGE : null,
            after,
            before
          }
        })
      });
      let apiRes = await rawApiRes.json();
      let authed = false;
      let authedUser;
      if (apiRes?.data?.authed) {
        authed = apiRes.data.authed;
        authedUser = apiRes.data?.authedUser
      }
      const searchConn = apiRes?.data?.searchStudysets;
      if (searchConn !== undefined && searchConn !== null) {
        const results = searchConn.edges?.map((e) => e.node) ?? [];
        return {
          query: searchQuery,
          header: {
            activePage: "explore",
            searchQuery: searchQuery
          },
          results,
          pageInfo: searchConn?.pageInfo,
          PER_PAGE,
          authed: authed,
          authedUser: authedUser
        }
      } else {
        console.log("Error in search +page.server.js, api res: ", apiRes)
        error(500, {
          message: "looks like this is broken, idk why though :("
        })
      }
    } catch (err) {
      console.error("Error in search +page.server.js: ", err);
      error(500, {
        message: "something went wrong, idk"
      }
      )
    }
  } else {
    redirect(307, "/explore");
  }
}
