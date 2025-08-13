import { env } from '$env/dynamic/private';

export async function load({ cookies }) {
    const authToken = cookies.get("auth");
  try {
  let response = await fetch(env.API_URL + "/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": authToken != null ?
        `Bearer ${authToken}` :
        undefined
    },
    body: JSON.stringify({
      query: `query {
        authed
        authedUser {
          id
          username
          display_name
        }
        featuredStudysets {
          id
          title
          user_id
          user_display_name
          terms_count
          updated_at
        }
      }`
    })
  })
  try {
  let responseJson = await response.json()
      if (responseJson?.data?.featuredStudysets?.length >= 0) {
        return {
          authed: responseJson?.data?.authed,
          authedUser: responseJson?.data?.authedUser,
          featuredRows: responseJson.data.featuredStudysets,
          header: { activePage: "home" }
        };
      } else {
        return {
          authed: responseJson?.data?.authed,
          authedUser: responseJson?.data?.authedUser,
          featuredRows: false,
      header: { activePage: "home" }
        }
      }
    } catch (err) {
      console.error(err);
      return {
        featuredRows: false,
      header: { activePage: "home" }
      }
    };
  } catch (err) {
    console.error(err);
    return {
      featuredRows: false,
      header: { activePage: "home" }
    }
  };
}
