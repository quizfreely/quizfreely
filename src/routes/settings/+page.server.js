import fetchAuthData from "$lib/fetchAuthData.js"

export async function load({ locals, cookies, fetch }) {
    return {
        ...await fetchAuthData({ fetch }),
        theme: locals.theme,
        header: { activePage: "settings" },
        settingsSection: "general",
        dateTimeFormatHours: cookies?.get(
            "settingsdatetimeformathours"
        )
    }
}
