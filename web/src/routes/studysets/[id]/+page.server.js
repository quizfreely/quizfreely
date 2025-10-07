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
            query: `query publicStudyset($id: ID!) {
              authed
              authedUser {
                id
                username
                displayName
              }
              studyset(id: $id) {
                id
                title
                updatedAt
                user {
                    id
                    displayName
                }
                private
                saved
                folder {
                    id
                    name
                }
                terms {
                    id
                    term
                    def
                }
              }
            }`,
            variables: {
              id: params.id
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
          if (apiRes?.data?.studyset) {
            return {
              studyset: apiRes.data.studyset,
              authed: authed,
              authedUser: authedUser
            }
          } else {
            console.error(
                "API Error in studyset page load func: ",
                apiRes
            );
            error(404, {
              message: "Not Found"
            })
          }
      } catch (err) {
        console.error(
            "Error in studyset page load func: ",
            err
        );
        error(404, {
          message: "Not Found"
        })
      }
}
