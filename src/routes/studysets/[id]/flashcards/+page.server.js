import { error } from '@sveltejs/kit';

export async function load({ params, fetch }) {
      try {
        let rawApiRes = await fetch("/api/graphql", {
          method: "POST",
          headers: {
        "Content-Type": "application/json"
      },
          body: JSON.stringify({
            query: `query studysetFlashcards($id: ID!) {
              authed
              authedUser {
                id
                username
                displayName
              }
              studyset(id: $id) {
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
              terms: apiRes.data.studyset.terms,
              cloudId: params.id,
              authed: authed,
              authedUser: authedUser
            }
          } else {
            console.error(
                "API Error in flashcards page load func: ",
                apiRes
            );
            error(404, {
              message: "Not Found"
            })
          }
      } catch (err) {
        console.error(
            "Error in flashcards page load func: ",
            err
        );
        error(404, {
          message: "Not Found"
        })
      }
}
