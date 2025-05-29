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
        streamPage: "classwork",
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
                            assignments {
                                id
                                title
                                dueAt
                                descriptionProseMirrorJson
                            }
                            assignmentDrafts {
                                id
                                title
                                dueAt
                                descriptionProseMirrorJson
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
                    if (result.classData?.classById?.assignments) {
                        for (
                            let index = 0;
                            index < result.classData.classById.assignments.length;
                            index++
                        ) {
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
                    if (result.classData?.classById?.assignmentDrafts) {
                        for (
                            let index = 0;
                            index < result.classData.classById.assignmentDrafts.length;
                            index++
                        ) {
                            if (result.classData.classById.assignmentDrafts[index]?.dueAt) {
                                result.classData.classById.assignmentDrafts[
                                    index
                                ].renderedDueDate = fancyTimestamp.format(
                                    result.classData.classById.assignmentDrafts[index]?.dueAt
                                );
                            }
                            try {
                                const contentJson = JSON.parse(
                                    result.classData.classById.assignmentDrafts[
                                        index
                                    ].descriptionProseMirrorJson
                                )
                                let div = document.createElement("div");
                                div.appendChild(DOMSerializer.fromSchema(schema).serializeFragment(
                                    Node.fromJSON(schema, contentJson),
                                    { document }
                                ));
                                result.classData.classById.assignmentDrafts[
                                    index
                                ].safeRenderedHtml = sanitizeHtml(
                                    div.innerHTML,
                                    sanitizeHtmlOptions
                                );
                            } catch (error) {
                                console.error(
                                    "Error rendering assignment draft description prosemirror:",
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

