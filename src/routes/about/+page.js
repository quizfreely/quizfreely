export async function load({ fetch }) {
  try {
        const now = Date.now();
        const h24 = 24*60*60*1000;
        const h24Ago = new Date(now - h24).toISOString();
        const d30Ago = new Date(now - 30*h24).toISOString();
  let response = await fetch("/api/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `query($day: String, $month: String) {
        authed
        authedUser {
          id
          username
          displayName
        }
        countDay: studysetCount(after: $day, includePrivate: true)
        countMonth: studysetCount(after: $month, includePrivate: true)
        countTotal: studysetCount(includePrivate: true)
        termCount
      }`,
      // query: `query {
      //   authed
      //   authedUser {
      //     id
      //     username
      //     displayName
      //   }
      //   featuredStudysets {
      //     id
      //     title
      //     user {
      //       id
      //       displayName
      //     }
      //     termsCount
      //     updatedAt
      //   }
      // }`
                variables: {
                    day: h24Ago,
                    month: d30Ago
                },
    })
  })
  try {
  let responseJson = await response.json()
      // if (responseJson?.data?.featuredStudysets?.length >= 0) {
      //   return {
      //     authed: responseJson?.data?.authed,
      //     authedUser: responseJson?.data?.authedUser,
      //     featuredRows: responseJson.data.featuredStudysets,
      //     header: { activePage: "home" }
      //   };
      // } else {
console.log(responseJson)
        return {
          authed: responseJson?.data?.authed,
          authedUser: responseJson?.data?.authedUser,
          // featuredRows: false,
            dailyCount: responseJson?.data?.countDay ?? 0,
            monthlyCount: responseJson?.data?.countMonth ?? 0,
            totalCount: responseJson?.data?.countTotal ?? 0,
            totalTermCount: responseJson?.data?.termCount ?? 0,
      header: { activePage: "home" }
        }
      // }
    } catch (err) {
      console.error("Error in about/+page.js: ", err);
      return {
        // featuredRows: false,
            dailyCount: 0,
            monthlyCount: 0,
            totalCount: 0,
            totalTermCount: 0,
      header: { activePage: "home" }
      }
    };
  } catch (err) {
    console.error("Error in about/+page.js: ", err);
    return {
      // featuredRows: false,
            dailyCount: 0,
            monthlyCount: 0,
            totalCount: 0,
            totalTermCount: 0,
      header: { activePage: "home" }
    }
  };
}
