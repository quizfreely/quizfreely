export async function load({ cookies, params, locals}) {
    try {
        const data = await locals.sdk.TermStats({
            termId: params.termid
        });
        return {
            studysetId: params.id,
            termId: params.termid,
            term: data.term,
            authed: data.authed,
            authedUser: data.authedUser,
            settingsDateTimeFmtHours: cookies.get(
              "settingsdatetimeformathours"
            )
        }
    } catch (err) {
        console.error("Error in cloud term stats load func: ", err);
        return {
          studysetId: params.id,
          termId: params.termid,
          authed: false,
          settingsDateTimeFmtHours: cookies.get(
            "settingsdatetimeformathours"
          )
        }
    }
}
