import fetchAuthData from "$lib/auth-data.server";

export async function load({ locals }) {
    return {
        ...await fetchAuthData({ locals }),
        header: {
            /* show sign up link button on sign in page instead of sign in link on its own page */
            showSignUpLink: true
        }
    }
};
