import { env } from '$env/dynamic/public';
import { error } from '@sveltejs/kit';

export async function load({ cookies, params, url }) {
    const PER_PAGE = 24;
    const userId = params.userid;
    const after = url.searchParams.get("after");
    const before = url.searchParams.get("before");

    try {
        let rawApiRes = await fetch(env.API_URL + "/graphql", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + cookies.get("auth"),
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query: `query($id: ID!, $first: Int, $after: String, $before: String) {
              user(id: $id) {
                id
                username
                displayName
                studysets(first: $first, after: $after, before: $before) {
                  edges { 
                    node { 
                      id 
                      title 
                      termsCount 
                      updatedAt 
                      user { displayName }
                    } 
                  }
                  pageInfo { hasNextPage hasPreviousPage startCursor endCursor }
                }
              }
            }`,
                variables: {
                    id: userId,
                    first: PER_PAGE,
                    after,
                    before
                }
            })
        });

        let apiRes = await rawApiRes.json();

        if (apiRes.errors) {
            console.error(apiRes.errors);
            throw error(404, "User not found");
        }

        const user = apiRes?.data?.user;
        if (!user) {
            throw error(404, "User not found");
        }

        const studysetsConn = user.studysets;

        return {
            user: {
                id: user.id,
                username: user.username,
                displayName: user.displayName
            },
            studysets: studysetsConn?.edges?.map((e) => e.node) ?? [],
            pageInfo: studysetsConn?.pageInfo,
            PER_PAGE,
            // header: {
            //     activePage: ""
            // }
        };

    } catch (err) {
        if (err.status === 404) {
            throw err;
        }
        console.error(err);
        throw error(500, "Internal Server Error");
    }
}
