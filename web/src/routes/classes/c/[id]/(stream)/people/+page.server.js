import fetchAuthData from "$lib/fetchAuthData.server";
import { env } from '$env/dynamic/private';

export async function load({ cookies, params }) {
    let result = {
        ...await fetchAuthData({ cookies }),
        streamPage: "people",
        header: { activePage: "classes" },
        classId: params.id
    };
    if (env?.ENABLE_CLASSES == "true") {
        try {
            let response = await fetch(env.CLASSES_API_URL + "/graphql", {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + cookies?.get("auth"),
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    query: `query classPage($id: ID!) {
                        classById(id: $id) {
                            id
                            name
                            course {
                                id
                                name
                            }
                            teachers {
                                id
                                displayName
                                username
                                oauthGoogleEmail
                            }
                            students {
                                id
                                displayName
                                username
                                oauthGoogleEmail
                            }
                            color
                            userSettings {
                                color
                            }
                        }
                    }`,
                    variables: {
                        "id": params.id
                    }
                })
            })
            try {
                let responseJson = await response.json();
                if (responseJson?.data) {
                    result.classData = responseJson.data;
                    return result;
                } else {
                    console.error(responseJson);
                    return result;
                }
            } catch (error) {
                //request.log.error(error);
                console.error(error);
                return result;
            }
        } catch (error) {
            //request.log.error(error);
            console.error(error);
            return result;
        };
    } else {
        return result;
    }
}

