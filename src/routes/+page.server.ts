import { redirect } from "@sveltejs/kit";
import { load as dashboardLoad } from "./dashboard/+page.server";
import { load as landingPageLoad } from "./landing-page/+page.server";

export async function load(event) {
    const { cookies, locals } = event;
    if (cookies.get("dashboard") == "true" || cookies.get("auth") !== undefined) {
        redirect(307, "/dashboard");
    } else {
        return {
            ...await landingPageLoad(event as any),
            dashboard: false
        }
    }
}
