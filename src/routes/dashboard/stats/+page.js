export async function load({ fetch }) {
    let data;
    try {
        const respRaw = await fetch("/api/graphql", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                query: `query dashboardStats {
    authed
    authedUser {
        id
        username
        displayName
    }
    reviewEventStatsByDay(lastDaysBack: 365) {
        timestamp
        correct
        incorrect
    }
    myRecentActivityStudysets(first: 100) {
        edges { node { id title private termsCount updatedAt } }
    }
    activityHistory(last: 40) {
        __typename
        ... on PracticeTest {
            id
            timestamp
            questionsCorrect
            questionsTotal
            studysets {
                id
                title
            }
        }
        ... on MatchActivity {
            id
            endTimestamp
            durationMs
            incorrectPairIds
            studysets {
                id
                title
            }
        }
    }
}`,
            })
        });
        const resp = await respRaw.json();
        if (resp?.data == null || resp?.errors != null) {
            console.log("Error in dashboard/stats load func api request. Response: ", resp);
        }
        data = resp?.data;
    } catch (err) {
        console.error("Error in dashboard/stats load func: ", err);
        data = {
          authed: false,
        }
    }

    return {
        ...data,
        dashboardPage: "stats",
        header: { activePage: "home" },
    }
};
