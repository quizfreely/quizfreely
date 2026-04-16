export async function load({ url, locals }) {
    const studysetId = url.searchParams.get("studysetId");
    let localId = parseInt(url.searchParams.get("localId") ?? "");
    if (isNaN(localId)) {
        localId = 0;
    }
    let respData = {};
    if (studysetId) {
        try {
            const { data } = await locals.sdk.HostStartReviewGame({
                id: studysetId
            });
            respData = data;
        } catch (err) {
            console.error("Error in /host load func: ", err);
        }
    } else {
        try {
            const { data } = await locals.sdk.AuthData();
            respData = data;
        } catch (err) {
            console.error("Error in /host load func: ", err);
        }
    }
    return {
        studysetId,
        localId,
        ...respData
    }
}
