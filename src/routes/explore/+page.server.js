export async function load({ fetch }) {
    try {
        let rawApiRes = await fetch("/api/graphql", {
          method: "POST",
          headers: {
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
        if (apiRes?.data?.authed) {
          authed = apiRes.data.authed;
          authedUser = apiRes.data?.authedUser;
        }
        
        return {
            explorePage: "subjects",
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
            explorePage: "subjects",
            authed: false,
            header: {
                activePage: "explore"
            }
        }
      }
}
