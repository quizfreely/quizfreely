import {EditorState, Plugin} from 'prosemirror-state';
import {EditorView, Decoration, DecorationSet} from 'prosemirror-view';
import {keymap} from 'prosemirror-keymap';
import {baseKeymap, toggleMark} from 'prosemirror-commands';
import {history, undo, redo} from 'prosemirror-history';
import { schema } from "$lib/proseMirrorSchema.js";

export { undo, redo };

function buildKeymap(schema) {
  const keys = {};

  keys["Mod-b"] = toggleMark(schema.marks.bold);
  keys["Mod-i"] = toggleMark(schema.marks.italic);
  keys["Mod-u"] = toggleMark(schema.marks.underline);
  keys["Mod-d"] = toggleMark(schema.marks.strike);
  keys["Mod-z"] = undo;
  keys["Mod-y"] = redo;
  keys["Mod-Shift-z"] = redo;

  return keymap(keys);
}

function placeholderPlugin(text) {
  return new Plugin({
    props: {
      decorations(state) {
        const docEmpty = state.doc.childCount === 1 && state.doc.firstChild?.isTextblock && state.doc.firstChild.content.size === 0;

        if (!docEmpty) return null;

        const placeholder = DecorationSet.create(state.doc, [
          Decoration.widget(1, () => {
            const span = document.createElement('span');
            span.className = 'placeholder';
            span.textContent = text;
            return span;
          }, { side: -1 }) // show before first real text
        ]);

        return placeholder;
      }
    }
  });
}

function markTrackingPlugin(updateMarks) {
  return new Plugin({
    view(view) {
      updateMarks(getActiveMarks(view.state));
      return {
        update(view) {
          updateMarks(getActiveMarks(view.state));
        }
      };
    }
  });
}

function getActiveMarks(state) {
  const { from, $from, to, empty } = state.selection;
  let active = {};

  if (empty) {
    state.schema.marks && Object.keys(state.schema.marks).forEach(markName => {
      active[markName] = !!state.storedMarks?.some(m => m.type.name === markName) ||
                         !!$from.marks().some(m => m.type.name === markName);
    });
  } else {
    state.doc.nodesBetween(from, to, node => {
      if (!node.isText) return;
      node.marks.forEach(mark => {
        active[mark.type.name] = true;
      });
    });
  }

  return active;
}

export function createEditor(
    dom,
    placeholder,
    updateActiveMarksFunc,
    dispatchTransactionFunc,
) {
  const state = EditorState.create({
    schema,
    plugins: [
      history(),
      buildKeymap(schema),
      keymap(baseKeymap),
      placeholderPlugin(placeholder),
      markTrackingPlugin(updateActiveMarksFunc)
    ]
  });

    return new EditorView(dom, {
        state,
        dispatchTransaction: dispatchTransactionFunc
    });
}

