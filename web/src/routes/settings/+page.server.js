import fetchAuthData from "$lib/fetchAuthData.server"

export async function load({ locals, cookies }) {
    return {
        ...await fetchAuthData({ cookies }),
        theme: locals.theme,
        header: { activePage: "settings" },
        settingsSection: "general",
        dateTimeFormatHours: cookies?.get(
            "settingsdatetimeformathours"
        )
    }
}
