import fetchAuthData from "$lib/fetchAuthData.server";

export async function load({ cookies }) {
    return {
        ...await fetchAuthData({ cookies }),
        dashboardPage: "activities",
      header: { activePage: "home" },
    }
};
