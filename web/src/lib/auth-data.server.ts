export default async function ({ locals }: { locals: App.Locals }) {
    let authed = false;
    let authedUser;
    let apiError = false;
    if (locals.hasAuthCookie) {
        try {
            const data = await locals.sdk.AuthData();
            if (data.authed != null) {
                authed = data.authed;
            }
            authedUser = data.authedUser;
        } catch (error) {
            console.error("Error in auth-data.server.ts", error);
            apiError = true;
        }
    }
    return {
        authed: authed,
        authedUser: authedUser,
        apiError: apiError,
    };
}
