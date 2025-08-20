import fetchAuthData from '$lib/fetchAuthData.server'
import { env } from "$env/dynamic/private";

export async function load({ cookies, params}) {
    try {
        const respRaw = await fetch(env.API_URL + "/graphql", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${cookies.get("auth")}`
            },
            body: JSON.stringify({
                query: `query loadPracticeTest($studysetId: ID!) {
    authed
    authedUser {
        id
        username
        display_name
    }
    studyset(id: $id) {
        id
        title
        updated_at
        user {
            id
            display_name
        }
        private
        terms {
            id
            term
            def
        }
    }
}`,
                variables: {
                    studysetId: params.id
                }
            })
        });
        const resp = await respRaw.json();
        return {
            studysetId: params.id,
            studyset: resp?.data?.studyset,
            authed: resp?.data?.authed,
            authedUser: resp?.data?.authedUser
        }
    } catch (err) {
        console.error("Error in cloud studyset practice test load func: ", err);
        return {
          studysetId: params.id,
          authed: false
        }
    }
}
