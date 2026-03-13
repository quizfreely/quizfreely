import fetchAuthData from "$lib/auth-data.server";
import { error } from "@sveltejs/kit";

export async function load({ params, url, cookies }) {
    let localId = parseInt(url.searchParams.get("id"));
    return {
        ...await fetchAuthData({ cookies }),
        localId: localId
    }
}
