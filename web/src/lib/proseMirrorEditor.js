// $lib/editor.ts
import {EditorState} from 'prosemirror-state';
import {EditorView} from 'prosemirror-view';
import {Schema} from 'prosemirror-model';
import {keymap} from 'prosemirror-keymap';
import {baseKeymap, toggleMark} from 'prosemirror-commands';
import {history, undo, redo} from 'prosemirror-history';

export const schema = new Schema({
  nodes: {
    doc: {content: "block+"},
    paragraph: {
      group: "block",
      content: "inline*",
      parseDOM: [{tag: "p"}],
      toDOM() { return ["p", 0]; }
    },
    heading: {
      attrs: {level: {default: 1}},
      content: "inline*",
      group: "block",
      defining: true,
      parseDOM: [
        {tag: "h1", attrs: {level: 1}},
        {tag: "h2", attrs: {level: 2}}
      ],
      toDOM(node) {
        return ["h" + node.attrs.level, 0];
      }
    },
    text: {group: "inline"}
  },
  marks: {
    bold: {
      parseDOM: [{tag: "strong"}, {style: "font-weight=bold"}],
      toDOM() { return ["strong", 0]; }
    },
    italic: {
      parseDOM: [{tag: "i"}, {style: "font-style=italic"}],
      toDOM() { return ["em", 0]; }
    },
    underline: {
      parseDOM: [{tag: "u"}, {style: "text-decoration=underline"}],
      toDOM() { return ["u", 0]; }
    },
    strike: {
      parseDOM: [{tag: "s"}, {tag: "del"}, {style: "text-decoration=line-through"}],
      toDOM() { return ["s", 0]; }
    },
    superscript: {
      parseDOM: [{tag: "sup"}],
      toDOM() { return ["sup", 0]; }
    },
    subscript: {
      parseDOM: [{tag: "sub"}],
      toDOM() { return ["sub", 0]; }
    }
  }
});

function buildKeymap(schema) {
  const mac = typeof navigator !== 'undefined' && /Mac/.test(navigator.platform);
  const keys = {};

  keys["Mod-b"] = toggleMark(schema.marks.bold);
  keys["Mod-i"] = toggleMark(schema.marks.italic);
  keys["Mod-u"] = toggleMark(schema.marks.underline);
  keys["Mod-d"] = toggleMark(schema.marks.strike);
  keys["Mod-z"] = undo;
  keys[mac ? "Mod-Shift-z" : "Mod-y"] = redo;

  return keymap(keys);
}

export function createEditor(dom) {
  const state = EditorState.create({
    schema,
    plugins: [
      history(),
      buildKeymap(schema),
      keymap(baseKeymap)
    ]
  });

  return new EditorView(dom, { state });
}

