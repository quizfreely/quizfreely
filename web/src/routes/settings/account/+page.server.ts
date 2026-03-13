import fetchAuthData from "$lib/auth-data.server"

export async function load({ locals, cookies }) {
    return {
        ...await fetchAuthData({ cookies }),
        header: { activePage: "settings" },
        settingsSection: "account"
    }
}
