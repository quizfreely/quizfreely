import fetchAuthData from "$lib/fetchAuthData.server";
import { env } from '$env/dynamic/private';
import sanitizeHtml from "sanitize-html";
import { JSDOM } from "jsdom";
import { fancyTimestamp } from "$lib/fancyTimestamp.js";

const sanitizeHtmlOptions = {
    allowedTags: [
        "p", "strong", "em", "u", "s", "sup", "sub"
    ],
    disallowedTagsMode: "escape",
    allowedAttributes: {},
    parseStyleAttributes: false
};
export async function load({ cookies, params }) {
    const { window } = new JSDOM("<div></div>");
    const document = window.document;
    const { DOMSerializer, Node } = await import("prosemirror-model");
    const { schema } = await import("$lib/proseMirrorSchema.js");
    let result = {
        ...await fetchAuthData({ cookies }),
        streamPage: "people",
        header: { activePage: "classes" },
        classId: params.id,
        assignmentId: params.assignmentid
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
                    query: `query assignmentPage($classId: ID!, $assignmentId: ID!) {
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
                    try {
                        const contentJson = JSON.parse(
                            result.classData.assignmentById.descriptionProseMirrorJson
                        )
                        let div = document.createElement("div");
                        div.appendChild(DOMSerializer.fromSchema(schema).serializeFragment(
                            Node.fromJSON(schema, contentJson),
                            { document }
                        ));
                        result.classData.assignmentById.safeRenderedHtml = sanitizeHtml(
                            div.innerHTML,
                            sanitizeHtmlOptions
                        );
                    } catch (error) {
                        console.error(
                            "Error rendering assignment prosemirror description:",
                            error
                        );
                    }
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

