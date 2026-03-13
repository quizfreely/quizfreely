import { env } from "$env/dynamic/public";
import { error } from '@sveltejs/kit';

export async function load({ params, locals }) {
    try {
        let data = await locals.sdk.PublicStudyset({
          id: params.id
        });
        let authed = false;
          let authedUser;
          if (apiRes?.data?.authed) {
            authed = apiRes.data.authed;
            authedUser = apiRes.data?.authedUser;
          }
          if (apiRes?.data?.studyset) {
            asdfjklasdjfklas joiasdf jk
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
