import { env } from "$env/dynamic/public";
import { error } from '@sveltejs/kit';

export async function load({ params, cookies }) {
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
        let rawApiRes = await fetch(env.API_URL + "/graphql", {
          method: "POST",
          headers: headers,
          body: JSON.stringify({
            query: `query subjectPage($id: String!) {
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
                studysets(first: 100) {
                  edges { node { id title termsCount saved folder { id name } } }
                  pageInfo { hasNextPage endCursor }
                }
              }
            }`,
            variables: {
              id: params.subject
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
                  studysets: rawSubject.studysets?.edges?.map((e) => e.node) ?? []
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
