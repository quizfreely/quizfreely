import fetchAuthData from "$lib/fetchAuthData.server";
import { env } from '$env/dynamic/private';

export async function load({ cookies }) {
    let classesData;
    let classesError;
    if (env?.ENABLE_CLASSES == "true") {
        try {
            let response = await fetch(env.CLASSES_API_URL + "/graphql", {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + cookies?.get("auth"),
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    query: `query {
                        authedUser {
                            id
                        }
                        classesAsStudent {
                            id
                            name
                            color
                            course {
                                id
                                name
                            }
                            userSettings {
                                color
                            }
                        }
                        classesAsTeacher {
                            id
                            name
                            color
                            course {
                                id
                                name
                            }
                            userSettings {
                                color
                            }
                        }
                    }`
                })
            })
            try {
                classesData = (await response.json())?.data
            } catch (error) {
                //request.log.error(error);
                classesError = error;
            }
        } catch (error) {
            //request.log.error(error);
            classesError = error;
        };
        return {
            ...await fetchAuthData({ cookies }),
            classesData: classesData,
        enableOAuthGoogle: (env.ENABLE_OAUTH_GOOGLE == "true"),
            header: { activePage: "classes" }
        }
    } else {
        return {
            ...await fetchAuthData({ cookies }),
        enableOAuthGoogle: (env.ENABLE_OAUTH_GOOGLE == "true"),
            header: { activePage: "classes" }
        }
    }
}

