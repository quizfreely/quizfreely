import fetchAuthData from "$lib/fetchAuthData.server"

export async function load({ locals, fetch }) {
    return {
        ...await fetchAuthData({ fetch }),
        header: { activePage: "settings" },
        settingsSection: "account"
    }
}
