import fetchAuthData from "$lib/fetchAuthData.server";
import { env } from '$env/dynamic/private';

export async function load({ cookies }) {
    return {
        ...await fetchAuthData({ cookies }),
        header: { activePage: "classes" }
    }
}

