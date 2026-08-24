import fetchAuthData from "$lib/fetchAuthData.js"

export async function load({ locals, fetch }) {
    return {
        ...await fetchAuthData({ fetch }),
        header: { activePage: "settings" },
        settingsSection: "account"
    }
}
