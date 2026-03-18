import { env } from "$env/dynamic/public";
import { error } from '@sveltejs/kit';

export async function load({ params, locals }) {
    try {
        const data = await locals.sdk.PublicStudyset({
          id: params.id
        });
        let authed = false;
        let authedUser;
        if (data.authed) {
          authed = data.authed;
          authedUser = data.authedUser;
        }
        if (data.studyset) {
          return {
            studyset: data.studyset,
            authed: authed,
            authedUser: authedUser
          }
        } else {
          console.error(
              "API Error in studyset page load func: ",
              data
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
