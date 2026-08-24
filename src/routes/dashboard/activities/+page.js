import fetchAuthData from "$lib/fetchAuthData.js";

export async function load({ fetch }) {
    return {
        ...await fetchAuthData({ fetch }),
        dashboardPage: "activities",
      header: { activePage: "home" },
    }
};
