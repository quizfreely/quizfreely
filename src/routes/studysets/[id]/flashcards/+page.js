import { redirect } from "@sveltejs/kit";

export function load({ params }) {
    redirect(308, `/flashcards?studyset=${params.id}`);
}
