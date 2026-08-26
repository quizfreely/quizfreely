import { redirect } from "@sveltejs/kit";

export function load({ params }) {
    redirect(308, `/term-stats?term=${params.termid}&studyset=${params.id}`);
}
