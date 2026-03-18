import fetchAuthData from "$lib/auth-data.server";
import { error } from "@sveltejs/kit";

export async function load({ params, url, locals }) {
    let localId = parseInt(url.searchParams.get("id") ?? "");
    return {
        ...await fetchAuthData({ locals }),
        localId: localId
    }
}
