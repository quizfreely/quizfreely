import fetchAuthData from "$lib/fetchAuthData.server";
import { env } from "$env/dynamic/public";

export async function load({ cookies }) {
    return {
        ...await fetchAuthData({ cookies }),
        enableOAuthGoogle: (env.ENABLE_OAUTH_GOOGLE == "true")
    }
};
