import fetchAuthData from "$lib/fetchAuthData.js";

export async function load({ fetch }) {
    return {
        ...await fetchAuthData({ fetch }),
        header: {
            /* show sign up link button on sign in page instead of sign in link on its own page */
            showSignUpLink: true
        }
    }
};
