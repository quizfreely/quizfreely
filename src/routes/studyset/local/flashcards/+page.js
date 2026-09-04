import { redirect } from "@sveltejs/kit";

export function load({ url }) {
    redirect(308, `/flashcards?localStudyset=${url.searchParams.get("id")}`);
}
