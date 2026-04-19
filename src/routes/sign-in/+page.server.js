import fetchAuthData from "$lib/fetchAuthData.server";

export async function load({ cookies }) {
    return {
        ...await fetchAuthData({ cookies }),
        header: {
            /* show sign up link button on sign in page instead of sign in link on its own page */
            showSignUpLink: true
        }
    }
};
