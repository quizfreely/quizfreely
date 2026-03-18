export async function load({cookies, params, locals}) {
    try {
        const data = await locals.sdk.ViewPracticeTest({
            id: params.id
        });
        return {
            practiceTestId: params.id,
            practiceTest: data.practiceTest,
            studysetId: data.practiceTest?.studysetId,
            authed: data.authed,
            authedUser: data.authedUser,
            settingsDateTimeFmtHours: cookies.get(
              "settingsdatetimeformathours"
            )
        }
    } catch (err) {
        console.error("Error in cloud practice test (viewing) load func: ", err);
        return {
          practiceTestId: params.id,
          authed: false,
          settingsDateTimeFmtHours: cookies.get(
            "settingsdatetimeformathours"
          )
        }
    }
}
