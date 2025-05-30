import fetchAuthData from "$lib/fetchAuthData.server";
import { env } from '$env/dynamic/private';

export async function load({ locals, cookies, params }) {
    let result = {
        ...await fetchAuthData({ cookies }),
        streamPage: "people",
        header: { activePage: "classes" },
        classId: params.id,
        assignmentId: params.assignmentid,
        theme: locals.theme
    };
    try {
        let response = await fetch(env.CLASSES_API_URL + "/graphql", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + cookies?.get("auth"),
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query: `query assignmentEditPage($classId: ID!, $assignmentId: ID!) {
                    classById(id: $classId) {
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
                    assignmentById(id: $assignmentId) {
                        title
                        dueAt
                        points
                        descriptionProseMirrorJson
                    }
                }`,
                variables: {
                    "classId": params.id,
                    "assignmentId": params.assignmentid
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
}

