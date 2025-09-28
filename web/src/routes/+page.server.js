import { redirect } from "@sveltejs/kit";
import { load as dashboardLoad } from "./dashboard/+page.server";
import { load as landingPageLoad } from "./landing-page/+page.server";

export async function load({ cookies, locals }) {
    if (cookies.get("dashboard") == "true") {
        redirect(307, "/dashboard");
    } else {
        return {
            ...await landingPageLoad({ cookies }),
            dashboard: false
        }
    }
}
