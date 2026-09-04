import { redirect } from "@sveltejs/kit";

export function load({ url }) {
    redirect(308, `/stats?localStudyset=${url.searchParams.get("id")}`);
}
