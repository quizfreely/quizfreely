import { redirect } from "@sveltejs/kit";

export function load({ params }) {
    redirect(308, `/match?studyset=${params.id}`);
}
