import { env } from '$env/dynamic/public';

export async function load({ cookies }) {
    const authToken = cookies.get("auth");
  try {
  let response = await fetch(env.API_URL + "/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": authToken != null && authToken != "" ?
        `Bearer ${authToken}` :
        undefined
    },
    body: JSON.stringify({
      query: `query {
        authed
        authedUser {
          id
          username
          displayName
        }
      }`
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
        return {
          authed: responseJson?.data?.authed,
          authedUser: responseJson?.data?.authedUser,
          // featuredRows: false,
      header: { activePage: "home" }
        }
      // }
    } catch (err) {
      console.error("Error in landing-page/+page.server.js: ", err);
      return {
        // featuredRows: false,
      header: { activePage: "home" }
      }
    };
  } catch (err) {
    console.error("Error in landing-page/+page.server.js: ", err);
    return {
      // featuredRows: false,
      header: { activePage: "home" }
    }
  };
}
