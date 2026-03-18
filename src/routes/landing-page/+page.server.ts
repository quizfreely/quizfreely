export async function load({ locals }) {
  try {
    const data = await locals.sdk.AuthData();
    return {
      authed: data.authed,
      authedUser: data.authedUser,
      header: { activePage: "home" }
    };
  } catch (err) {
    console.error("Error in landing-page load func: ", err);
    return {
      authed: false,
      header: { activePage: "home" }
    };
  }
}
