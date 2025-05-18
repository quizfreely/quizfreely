import { load as classesDashboardLoad } from "./ClassesDashboard.server";
import { load as classesFeatureLoad } from "./features/+page.server";
import { load as classesLandingPageLoad } from "./landing-page/+page.server";

export async function load({ cookies, locals }) {
    if (cookies.get("auth")) {
        return {
            ...await classesDashboardLoad({ cookies: cookies, locals: locals }),
            classesPage = "dashboard"
        }
    } else if (cookies.get("dashboard") == "true") {
        return {
            ...await classesFeaturesLoad({ cookies: cookies, locals: locals }),
            classesPage = "feature"
        }
    } else {
        return {
            ...await classesLandingPageLoad(),
            classesPage = "landing"
        }
    }
}
