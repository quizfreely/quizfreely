import { JSDOM } from "jsdom";
import { DOMParser as PMDOMParser } from "prosemirror-model";
import { schema as basicSchema } from "prosemirror-schema-basic";

function convertPlaintextToPMJsonServer(plaintext) {
  const dom = new JSDOM("<div></div>");
  const div = dom.window.document.querySelector("div");
  div.innerHTML = plaintext.split(/\n+/).map(
    line => `<p>${line}</p>`
  ).join("");

  const doc = PMDOMParser.fromSchema(basicSchema).parse(div);
  return doc.toJSON();
}

