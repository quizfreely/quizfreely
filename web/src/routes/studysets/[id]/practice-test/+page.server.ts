export async function load({ locals, cookies, params}) {
    let data;
    try {
        data = await locals.sdk.StartPracticeTest({
            studysetId: params.id
        });
    } catch (err) {
        console.error("Error in cloud studyset practice test load func: ", err);
    }
    return {
        studysetId: params.id,
        studyset: data?.studyset,
        authed: data?.authed ?? false,
        authedUser: data?.authedUser,
        settingsDateTimeFmtHours: cookies.get(
          "settingsdatetimeformathours"
        )
    }
}
