import { redirect } from "@sveltejs/kit";

export function load({ params }) {
    redirect(308, `/practice-test?studyset=${params.id}`);
}
