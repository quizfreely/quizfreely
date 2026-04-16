export async function load({ locals, url }) {
  const PER_PAGE = 24;
  const recentlyUpdated = url.searchParams.has("updated");
  try {
    const after = url.searchParams.get("after");
    const before = url.searchParams.get("before");

    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()).toISOString();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const { data } = await locals.sdk.RecentStudysets({
      after,
      before,
      day: dayStart,
      week: weekStart,
      month: monthStart,
      first: PER_PAGE
    });

    let authed = false;
    let authedUser;
    if (data.authed) {
      authed = data.authed;
      authedUser = data.authedUser;
    }
    const createdConn = data.recentlyCreatedStudysets;
    const updatedConn = data.recentlyUpdatedStudysets;

    let totalCount = (recentlyUpdated ? data.updateCountTotal : data.countTotal) ?? 0;
    let newCount = (recentlyUpdated ? data.updateCountDay : data.countDay) ?? 0;
    let countWeek = (recentlyUpdated ? data.updateCountWeek : data.countWeek) ?? 0;
    let countMonth = (recentlyUpdated ? data.updateCountMonth : data.countMonth) ?? 0;

    let newPeriod = "today";
    if ((newCount <= 0 && countWeek >= 1) || (newCount <= 2 && countWeek > 3) || (newCount < 10 && countWeek >= 10)) {
      newCount = countWeek ?? 0;
      newPeriod = "this week";
    }
    if (newCount < 10 && countMonth >= 10) {
      newCount = countMonth ?? 0;
      newPeriod = "this month";
    }

    return {
      explorePage: recentlyUpdated ? "recently-updated" : "recently-created",
      recentlyCreatedStudysets: createdConn?.edges?.map((e: any) => e.node) ?? [],
      recentlyUpdatedStudysets: updatedConn?.edges?.map((e: any) => e.node) ?? [],
      pageInfo: recentlyUpdated ? updatedConn?.pageInfo : createdConn?.pageInfo,
      recentlyUpdated,
      newCount,
      newPeriod,
      totalCount,
      authed: authed,
      authedUser: authedUser,
      header: {
        activePage: "explore"
      },
      PER_PAGE
    }
  } catch (err) {
    console.error(err);
    return {
      explorePage: recentlyUpdated ? "recently-updated" : "recently-created",
      authed: false,
      header: {
        activePage: "explore"
      },
      recentlyCreatedStudysets: [],
      recentlyUpdatedStudysets: [],
      recentlyUpdated,
      PER_PAGE
    }
  }
}
