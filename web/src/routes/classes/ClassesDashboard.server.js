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
                            course {
                                id
                                name
                            }
                        }
                        classesAsTeacher {
                            id
                            name
                            course {
                                id
                                name
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
            header: { activePage: "classes" }
        }
    } else {
        return {
            ...await fetchAuthData({ cookies }),
            header: { activePage: "classes" }
        }
    }
}

