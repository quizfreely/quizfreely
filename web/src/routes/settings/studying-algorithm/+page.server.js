import fetchAuthData from "$lib/fetchAuthData.server"

export async function load({ locals, cookies }) {
    return {
        ...await fetchAuthData({ cookies }),
        header: { activePage: "settings" },
        settingsSection: "studying_algorithm"
    }
}
