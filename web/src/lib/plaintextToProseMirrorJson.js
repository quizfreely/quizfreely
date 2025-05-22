import { DOMParser as PMDOMParser } from "prosemirror-model";

export default function (plaintext) {
    const div = document.createElement("div");
    div.innerHTML = plaintext.split(/\n+/).map(
        line => `<p>${line}</p>`
    ).join("");

    const doc = PMDOMParser.fromSchema(schema).parse(div);
    return doc.toJSON();
}

