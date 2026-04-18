export async function load({ cookies, params, locals}) {
    try {
        const { data } = await locals.sdk.StudysetStats({
            studysetId: params.id
        });
        return {
            studysetId: params.id,
            studyset: data.studyset,
            authed: data.authed,
            authedUser: data.authedUser,
            settingsDateTimeFmtHours: cookies.get(
              "settingsdatetimeformathours"
            )
        }
    } catch (err) {
        console.error("Error in cloud studyset stats load func: ", err);
        return {
          studysetId: params.id,
          authed: false,
          settingsDateTimeFmtHours: cookies.get(
            "settingsdatetimeformathours"
          )
        }
    }
}
