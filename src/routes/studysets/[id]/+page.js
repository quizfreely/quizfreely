import { error } from '@sveltejs/kit';

export async function load({ params, fetch }) {
      try {
        let rawApiRes = await fetch("/api/graphql", {
          method: "POST",
          headers: {
        "Content-Type": "application/json"
      },
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
                myFolder {
                    id
                    name
                }
                terms {
                    id
                    term
                    def
                    termImageUrl
                    defImageUrl
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
              authedUser: authedUser,
              studysetSelection: {
                subHeaderClass: "with-badge",
                subHeaderStyle: "--badge-color: var(--warn); --badge-offset: -0.2rem;"
              }
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
