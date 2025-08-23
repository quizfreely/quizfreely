import { env } from '$env/dynamic/private';

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
              }
              featuredStudysets {
                id
                title
                user {
                    displayName
                }
                termsCount
                updatedAt
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
        let featuredStudysets = [];
        let recentStudysets = [];
        if (apiRes?.data?.authed) {
          authed = apiRes.data.authed;
          authedUser = apiRes.data?.authedUser;
        }
        if (apiRes?.data?.featuredStudysets?.length >= 0) {
          featuredStudysets = apiRes.data.featuredStudysets;
        }
        if (apiRes?.data?.recentStudysets?.length >= 0) {
          recentStudysets = apiRes.data.recentStudysets;
        }
        
        return {
            featuredStudysets: featuredStudysets,
            recentStudysets: recentStudysets,
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
