export async function load({ locals }) {
    try {
        const data = await locals.sdk.ExplorePage();
        let authed = false;
        let authedUser;
        if (data.authed) {
          authed = data.authed;
          authedUser = data.authedUser;
        }
        
        return {
            explorePage: "subjects",
            authed: authed,
            authedUser: authedUser,
            allSubjects: data.allSubjects,
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
