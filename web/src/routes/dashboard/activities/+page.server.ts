import fetchAuthData from "$lib/auth-data.server";

export async function load({ cookies }) {
    return {
        ...await fetchAuthData({ cookies }),
        dashboardPage: "activities",
      header: { activePage: "home" },
    }
};
