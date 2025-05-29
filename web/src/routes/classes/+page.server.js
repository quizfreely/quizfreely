import { load as classesDashboardLoad } from "./ClassesDashboard.server";

export async function load({ cookies, locals }) {
        return {
            ...await classesDashboardLoad({ cookies: cookies, locals: locals }),
            classesPage: "dashboard"
    }
}

