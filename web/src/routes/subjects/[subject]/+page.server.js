import { env } from "$env/dynamic/public";
import { error } from '@sveltejs/kit';

export async function load({ params, cookies, url }) {
  let headers = {
    "Content-Type": "application/json"
  };
  if (cookies.get("auth")) {
    headers = {
      "Authorization": "Bearer " + cookies.get("auth"),
      "Content-Type": "application/json"
    };
  }
  try {
    const PER_PAGE = 24;
    const after = url.searchParams.get("after");
    const before = url.searchParams.get("before");
    let rawApiRes = await fetch(env.API_URL + "/graphql", {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        query: `query subjectPage($id: String!, $first: Int, $after: String, $last: Int, $before: String) {
              authed
              authedUser {
                id
                username
                displayName
              }
              subject(id: $id) {
                id
                name
                category
                studysets(first: $first, after: $after, last: $last, before: $before) {
                  edges { node { id title termsCount saved folder { id name } } }
                  pageInfo { hasNextPage hasPreviousPage startCursor endCursor }
                }
              }
            }`,
        variables: {
          id: params.subject,
          first: before ? null : PER_PAGE,
          last: before ? PER_PAGE : null,
          after,
          before
        }
      })
    })
    let apiRes = await rawApiRes.json();
    let authed = false;
    let authedUser;
    if (apiRes?.data?.authed) {
      authed = apiRes.data.authed;
      authedUser = apiRes.data?.authedUser;
    }
    if (apiRes?.data) {
      const rawSubject = apiRes.data?.subject;
      const subject = rawSubject
        ? {
          ...rawSubject,
          studysets: rawSubject.studysets?.edges?.map((e) => e.node) ?? [],
          pageInfo: rawSubject.studysets?.pageInfo
        }
        : null;
      return {
        subject,
        authed: authed,
        authedUser: authedUser,
        header: {
          activePage: "explore"
        }
      }
    } else {
      console.error(
        "API Error in subject category page load func: ",
        apiRes
      );
      error(404, {
        message: "Not Found"
      })
    }
  } catch (err) {
    console.error(
      "Error in subject category page load func: ",
      err
    );
    error(404, {
      message: "Not Found"
    })
  }
}
