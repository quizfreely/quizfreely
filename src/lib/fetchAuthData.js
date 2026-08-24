export default async function ({ fetch }) {
    let authed = false;
    let authedUser;
    let apiError = false;
    try {
        let rawAuthedRes = await fetch("/api/graphql", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
            query: `query {
    authed
    authedUser {
        id
        username
        displayName
        authType
        oauthGoogleEmail
        modPerms
    }
}`
            })
        });
        let authedRes = await rawAuthedRes.json();
        if (authedRes?.data?.authed) {
            authed = authedRes.data.authed;
            authedUser = authedRes.data?.authedUser
        }
        apiError = false;
    } catch (error) {
        console.error(error);
        apiError = true;
    }
    return {
        authed: authed,
        authedUser: authedUser,
        apiError: apiError
    }
}
