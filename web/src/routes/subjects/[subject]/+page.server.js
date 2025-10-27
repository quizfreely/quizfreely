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
                studysets {
                  id
                  title
                  termsCount
                  saved
                  folder {
                    id
                    name
                  }
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
            return {
              subject: apiRes.data?.subject,
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
