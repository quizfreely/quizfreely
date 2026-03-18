import { error } from '@sveltejs/kit';

export async function load({ locals, params, url }) {
    const PER_PAGE = 24;
    const userId = params.userid;
    const after = url.searchParams.get("after");
    const before = url.searchParams.get("before");

    try {
        const data = await locals.sdk.UserPage({
            id: userId,
            first: PER_PAGE,
            after,
            before
        });

        const user = data?.user;
        if (!user) {
            throw error(404, "User not found");
        }

        const studysetsConn = user.studysets;

        return {
            authed: data?.authed,
            authedUser: data?.authedUser,
            user: {
                id: user.id,
                username: user.username,
                displayName: user.displayName
            },
            studysets: studysetsConn?.edges?.map((e: any) => e.node) ?? [],
            pageInfo: studysetsConn?.pageInfo,
            PER_PAGE,
            studysetCount: user?.studysetCount,
        };

    } catch (err: any) {
        if (err?.status === 404) {
            throw err;
        }
        console.error(err);
        throw error(500, "Internal Server Error");
    }
}
