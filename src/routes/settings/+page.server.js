import fetchAuthData from "$lib/fetchAuthData.js"

export async function load({ locals, fetch }) {
    return {
        ...await fetchAuthData({ fetch }),
        theme: locals.theme,
        header: { activePage: "settings" },
        settingsSection: "general",
    }
}
