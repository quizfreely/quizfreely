export async function load({ fetch }) {
    try {
        const now = Date.now();
        const h24 = 24*60*60*1000;
        const h24Ago = new Date(now - h24).toISOString();
        const d30Ago = new Date(now - 30*h24).toISOString();
        let rawApiRes = await fetch("/api/graphql", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query: `query($day: String, $month: String) {
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
                    countDay: studysetCount(after: $day, includePrivate: true)
                    countMonth: studysetCount(after: $month, includePrivate: true)
                    countTotal: studysetCount(includePrivate: true)
                }`,
                variables: {
                    day: h24Ago,
                    month: d30Ago
                },
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
            dailyCount: apiRes?.data?.countDay ?? 0,
            monthlyCount: apiRes?.data?.countMonth ?? 0,
            totalCount: apiRes?.data?.countTotal ?? 0,
            header: {
                activePage: "explore"
            },
        };
    } catch (err) {
        console.error(err);
        return {
            explorePage: "subjects",
            authed: false,
            dailyCount: 0,
            monthlyCount: 0,
            totalCount: 0,
            header: {
                activePage: "explore"
            },
        };
    }
}
