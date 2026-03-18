import fetchAuthData from "$lib/auth-data.server"

export async function load({ locals }) {
    return {
        ...await fetchAuthData({ locals }),
        header: { activePage: "settings" },
        settingsSection: "account"
    }
}
