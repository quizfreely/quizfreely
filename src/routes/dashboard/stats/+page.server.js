import { env } from "$env/dynamic/public";

export async function load({ cookies }) {
    let data;
    try {
        const respRaw = await fetch(env.API_URL + "/graphql", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${cookies.get("auth")}`
            },
            body: JSON.stringify({
                query: `query dashboardStats {
    authed
    authedUser {
        id
        username
        displayName
    }
    reviewEventStatsByDay(last: 366) {
        timestamp
        correct
        incorrect
    }
}`,
            })
        });
        const resp = await respRaw.json();
        if (resp?.data == null || resp?.errors != null) {
            console.log("Error in dashboard/stats load func api request. Response: ", resp);
        }
        data = {
            ...resp?.data,
            settingsDateTimeFmtHours: cookies.get(
              "settingsdatetimeformathours"
            )
        }
    } catch (err) {
        console.error("Error in dashboard/stats load func: ", err);
        data = {
          authed: false,
          settingsDateTimeFmtHours: cookies.get(
            "settingsdatetimeformathours"
          )
        }
    }

    return {
        ...data,
        dashboardPage: "stats",
        header: { activePage: "home" },
    }
};
