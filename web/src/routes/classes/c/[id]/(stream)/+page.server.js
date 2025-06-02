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
        streamPage: "stream",
        header: { activePage: "classes" },
        classId: params?.id
    };
    if (cookies?.get("settingsdatetimeformathours") == "24") {
        fancyTimestamp.hours = 24;
    } else if (cookies?.get("settingsdatetimeformathours") == "12") {
        fancyTimestamp.hours = 12;
    }
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
                                createdAt
                                updatedAt
                            }
                            assignments {
                                id
                                title
                                dueAt
                                descriptionProseMirrorJson
                                createdAt
                                updatedAt
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
                            let index = 0;
                            index < result.classData.classById.announcements.length;
                            index++
                        ) {
                            result.classData.classById.announcements[index].type = "announcement";
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
                                ].safeRenderedHtml = sanitizeHtml(
                                    div.innerHTML,
                                    sanitizeHtmlOptions
                                );
                            } catch (error) {
                                console.error(
                                    "Error rendering announcement prosemirror content:",
                                    error
                                );
                            }

                            if (
                                result.classData.classById.announcements[index]?.createdAt ==
                                result.classData.classById.announcements[index]?.updatedAt
                            ) {
                                result.classData.classById.announcements[
                                    index
                                ].renderedTimestamp = fancyTimestamp.format(
                                    result.classData.classById.announcements[index]?.createdAt
                                );
                            } else {
                                result.classData.classById.announcements[
                                    index
                                ].renderedTimestamp = fancyTimestamp.format(
                                    result.classData.classById.announcements[index]?.createdAt
                                ) + " · updated " + fancyTimestamp.format(
                                    result.classData.classById.announcements[index]?.updatedAt
                                );
                            }
                        }
                    }
                    if (result.classData?.classById?.assignments) {
                        for (
                            let index = 0;
                            index < result.classData.classById.assignments.length;
                            index++
                        ) {
                            result.classData.classById.assignments[index].type = "assignment";
                            if (result.classData.classById.assignments[index]?.dueAt) {
                                result.classData.classById.assignments[
                                    index
                                ].renderedDueDate = fancyTimestamp.format(
                                    result.classData.classById.assignments[index]?.dueAt
                                );
                            }
                            try {
                                const contentJson = JSON.parse(
                                    result.classData.classById.assignments[
                                        index
                                    ].descriptionProseMirrorJson
                                )
                                let div = document.createElement("div");
                                div.appendChild(DOMSerializer.fromSchema(schema).serializeFragment(
                                    Node.fromJSON(schema, contentJson),
                                    { document }
                                ));
                                result.classData.classById.assignments[
                                    index
                                ].safeRenderedHtml = sanitizeHtml(
                                    div.innerHTML,
                                    sanitizeHtmlOptions
                                );
                            } catch (error) {
                                console.error(
                                    "Error rendering assignment description prosemirror:",
                                    error
                                );
                            }
                        }
                    }
                    result.streamData = [];
                    if (result?.classData?.classById?.announcements) {
                        result.streamData = result.classData.classById.announcements;
                    }
                    if (result?.classData?.classById?.assignments) {
                        result.streamData = result.streamData.concat(result.classData.classById.assignments);
                    }
                    result.streamData.sort(function (a, b) {
                        return Date.parse(b.createdAt) - Date.parse(a.createdAt);
                    });
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

