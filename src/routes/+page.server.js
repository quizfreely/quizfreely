import { redirect } from "@sveltejs/kit";
import { load as landingPageLoad } from "./about/+page.server";

export async function load({ cookies, fetch }) {
    if (cookies.get("dashboard") == "true" || cookies.get("auth") !== undefined) {
        redirect(307, "/dashboard");
    } else {
        return {
            ...await landingPageLoad({ fetch }),
            dashboard: false
        }
    }
}
