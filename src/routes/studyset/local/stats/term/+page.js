import { redirect } from "@sveltejs/kit";

export function load({ url }) {
    redirect(308, `/term-stats?localTerm=${url.searchParams.get("id")}&localStudyset=${url.searchParams.get("studysetId")}`);
}
