import { env } from '$env/dynamic/public';
import { error } from '@sveltejs/kit';

export async function load({ cookies, params, url }) {
    const PER_PAGE = 24;
    const folderId = params.id;
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
              authed
              authedUser {
                id
                username
                displayName
              }
              folder(id: $id) {
                id
                name
                studysets(first: $first, after: $after, before: $before) {
                  edges {
                    node {
                      id
                      title
                      private
                      termsCount
                      updatedAt
                      myFolder {
                        id
                        name
                      }
                    }
                  }
                  pageInfo { hasNextPage hasPreviousPage startCursor endCursor }
                }
              }
            }`,
                variables: {
                    id: folderId,
                    first: PER_PAGE,
                    after,
                    before
                }
            })
        });

        let apiRes = await rawApiRes.json();

        if (apiRes.errors) {
            console.error(apiRes.errors);
            throw error(404, "Folder not found");
        }

        const folder = apiRes?.data?.folder;
        if (!folder) {
            throw error(404, "Folder not found");
        }

        const studysetsConn = folder.studysets;

        return {
            authed: apiRes?.data?.authed,
            authedUser: apiRes?.data?.authedUser,
            folder: {
                id: folder.id,
                name: folder.name
            },
            studysets: studysetsConn?.edges?.map((e) => e.node) ?? [],
            pageInfo: studysetsConn?.pageInfo,
            PER_PAGE
        };

    } catch (err) {
        if (err.status === 404) {
            throw err;
        }
        console.error(err);
        throw error(500, "Internal Server Error");
    }
}
