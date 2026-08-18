import fetchAuthData from "$lib/fetchAuthData.server";

export async function load({ fetch }) {
    return {
        ...await fetchAuthData({ fetch }),
        dashboardPage: "activities",
      header: { activePage: "home" },
    }
};
