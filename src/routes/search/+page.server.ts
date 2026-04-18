import { error, redirect } from '@sveltejs/kit';

export async function load({ locals, url }) {
  let searchQuery = (url.searchParams.get("q") ?? "")
  if (searchQuery.replace(/\s+/g, '') == "") {
    searchQuery = "";
  }

  if (searchQuery.length >= 1) {
    try {
      const PER_PAGE = 24;
      const after = url.searchParams.get("after");
      const before = url.searchParams.get("before");
      const { data } = await locals.sdk.SearchResults({
        q: url.searchParams.get("q") ?? "",
        first: before ? null : PER_PAGE,
        last: before ? PER_PAGE : null,
        after,
        before
      });

      let authed = false;
      let authedUser;
      if (data.authed) {
        authed = data.authed;
        authedUser = data.authedUser;
      }
      const searchConn = data.searchStudysets;
      if (searchConn !== undefined && searchConn !== null) {
        const results = searchConn.edges?.map((e: any) => e.node) ?? [];
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
        };
      } else {
        console.log("Error in search +page.server.js, data: ", data);
        error(500, {
          message: "looks like this is broken, idk why though :("
        });
      }
    } catch (err) {
      console.error("Error in search +page.server.js: ", err);
      error(500, {
        message: "something went wrong, idk"
      });
    }
  } else {
    redirect(307, "/explore");
  }
}
