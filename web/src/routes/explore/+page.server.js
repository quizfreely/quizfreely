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
              allSubjects {
                id
                name
                category
              }
            }`
          })
        });
        let apiRes = await rawApiRes.json();
        let authed = false;
        let authedUser;
        let recentStudysets = [];
        if (apiRes?.data?.authed) {
          authed = apiRes.data.authed;
          authedUser = apiRes.data?.authedUser;
        }
        if (apiRes?.data?.recentStudysets?.length >= 0) {
          recentStudysets = apiRes.data.recentStudysets;
        }
        
        console.log(apiRes)
        return {
            featuredCategories: apiRes?.data?.featuredCategories,
            recentStudysets: recentStudysets,
            authed: authed,
            authedUser: authedUser,
            allSubjects: apiRes?.data?.allSubjects,
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
