import { env } from '$env/dynamic/public';

export async function load({ cookies }) {
    try {
        let rawApiRes = await fetch(env.API_URL + "/graphql", {
          method: "POST",
          headers: {
            "Authorization": "Bearer " + cookies.get("auth"),
            "Content-Type": "application/json"
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
              recentStudysets {
                id
                title
                user {
                    displayName
                }
                termsCount
                updatedAt
              }
            }`
          })
        });
        let apiRes = await rawApiRes.json();
        let authed = false;
        let authedUser;
        if (apiRes?.data?.authed) {
          authed = apiRes.data.authed;
          authedUser = apiRes.data?.authedUser;
        }
        
        return {
            recentStudysets: apiRes?.data?.recentStudysets,
            authed: authed,
            authedUser: authedUser,
            header: {
                activePage: "explore"
            },
        }
      } catch (err) {
        console.error(err);
        return {
            authed: false,
            header: {
                activePage: "explore"
            }
        }
      }
}
