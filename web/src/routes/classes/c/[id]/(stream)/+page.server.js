import fetchAuthData from "$lib/fetchAuthData.server";
import { env } from '$env/dynamic/private';
import sanitizeHtml from "sanitize-html";
import { JSDOM } from "jsdom";

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
        streamPage: "stream",
        header: { activePage: "classes" }
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
                            color
                            userSettings {
                                color
                            }
                            announcements {
                                id
                                user {
                                    id
                                    displayName
                                }
                                contentProseMirrorJson
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
                    if (result.classData?.classById?.announcements) {
                        for (
                            let index = result.classData.classById.announcements.length - 1;
                            index >= 0;
                            index--
                        ) {
                            try {
                                const contentJson = JSON.parse(
                                    result.classData.classById.announcements[
                                        index
                                    ].contentProseMirrorJson
                                )
                                let div = document.createElement("div");
                                div.appendChild(DOMSerializer.fromSchema(schema).serializeFragment(
                                    Node.fromJSON(schema, contentJson),
                                    { document }
                                ));
                                result.classData.classById.announcements[
                                    index
                                ].safeHtml = sanitizeHtml(
                                    div.innerHTML,
                                    sanitizeHtmlOptions
                                );
                            } catch (error) {
                                console.error(
                                    "Error rendering announcement prosemirror content:",
                                    error
                                );
                            }
                        }
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

