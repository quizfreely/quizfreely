import fetchAuthData from "$lib/fetchAuthData.server";
import { error } from "@sveltejs/kit";

export async function load({ params, url, fetch }) {
    let localId = parseInt(url.searchParams.get("id"));
    return {
        ...await fetchAuthData({ fetch }),
        localId: localId
    }
}
