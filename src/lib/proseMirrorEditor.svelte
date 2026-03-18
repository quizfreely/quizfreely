<script lang="ts">
    import { onMount, onDestroy, tick } from 'svelte';
    import { createEditor, undo, redo } from '$lib/proseMirrorEditor';
    import 'prosemirror-view/style/prosemirror.css';
    import { schema } from '$lib/proseMirrorSchema';
    import { toggleMark, setBlockType } from 'prosemirror-commands';
    import { EditorState } from "prosemirror-state";
    import BoldIcon from "$lib/icons/Bold.svelte";
    import ItalicIcon from "$lib/icons/Italic.svelte";
    import UnderlineIcon from "$lib/icons/Underline.svelte";
    import StrikethroughIcon from "$lib/icons/Strikethrough.svelte";
    import SuperscriptIcon from "$lib/icons/Superscript.svelte";
    import SubscriptIcon from "$lib/icons/Subscript.svelte";
    import UndoIcon from "$lib/icons/Undo.svelte";
    import RedoIcon from "$lib/icons/Redo.svelte";
    import type { EditorView } from 'prosemirror-view';
    import type { NodeType } from 'prosemirror-model';

    let { placeholder, value = $bindable(), oninputcallback }: {
        placeholder: string,
        value?: any,
        oninputcallback?: () => void
    } = $props();

    let editorDiv: HTMLDivElement | undefined = $state();
    let view: EditorView | undefined = $state();
    let activeMarks: { [key: string]: boolean } = $state({});
    function updateActiveMarksFunc(marks: { [key: string]: boolean }) {
        activeMarks = marks;
    }

    const getContent = function () {
        return view?.state.doc.toJSON();
    };

    export function updateValueFromJson(newValue: any) {
        if (!view) return;
        try {
            const newDoc = schema.nodeFromJSON(newValue);
            const newState = EditorState.create({
              doc: newDoc,
              schema,
              plugins: view.state.plugins
            });
            view.updateState(newState);
            value = view.state.doc.toJSON();
        } catch (e) {
            console.error("Failed to update ProseMirror editor w updateValueFromJson:", e);
        }
    }
    export function clearValue() {
        if (!view) return;
        try {
            view.updateState(EditorState.create({
                schema,
                plugins: view.state.plugins
            }));
            value = view.state.doc.toJSON();
        } catch (e) {
            console.error("Failed to clear ProseMirror editor w clearValue:", e);
        }
    }

    onMount(() => {
        if (!editorDiv) return;
        view = createEditor(
            editorDiv,
            placeholder,
            updateActiveMarksFunc,
            function (tr) {
                if (!view) return;
                const newState = view.state.apply(tr);
                view.updateState(newState);
                value = getContent();
                if (oninputcallback) {
                    oninputcallback();
                }
            },
            // value
        );

        return () => {
            view?.destroy();
        };
    });

    onDestroy(() => {
        view?.destroy();
    });
    function toggleBlockType(nodeType: NodeType, attrs = {}) {
    return function (state: EditorState, dispatch: any) {
        const isActive = (state.selection as any).$from.parent.hasMarkup(nodeType, attrs);
        return isActive
            ? setBlockType(
                state.schema.nodes.paragraph
            )(state, dispatch)
            : setBlockType(
                nodeType, attrs
            )(state, dispatch);
    };
}
    function toggle(mark: string) {
      if (!view) return;
      let untoggle = false;
      if (activeMarks[mark]) {
        /* check state before calling toggleMark
        but use that check after calling toggleMark
        so that other marks are updated by prosemirror
        but this mark being unadded/untoggled is manually
        shown by this function */
        untoggle = true;
      }

      toggleMark(schema.marks[mark])(view.state, view.dispatch);

      if (untoggle) {
          /* "manually" change state to false when unselecting,
          for selecting, prosemirror already figures it out,
          but when removing marks the state doesnt immediately update */
          activeMarks[mark] = false;
        activeMarks[mark] = false;
      }
      
      view.focus();
    }

    function toggleHeading(level: number) {
      if (!view) return;
      toggleBlockType(schema.nodes.heading, { level })(view.state, view.dispatch);
      view.focus();
    }
</script>

<style>
    .container {
        overflow: hidden;
        margin-top: 0.4rem;
        background-color: var(--bg-1);
        border-radius: 0.8rem;
    }
    :global {
        .ProseMirror {
            margin-top: 0px;
            border-radius: 0.8rem;
            border: 0.2rem solid var(--border);
            padding: 0.8rem;
            min-height: 4rem;
            white-space: pre-wrap;
            overflow: hidden;
            outline: none;
        }
        .ProseMirror .placeholder {
          position: absolute;
          color: var(--fg-0);
          pointer-events: none;
          user-select: none;
        }
        .ProseMirror > p {
            margin-top: 0px;
        }

        .editor-toolbar-button {
            border-radius: 0.8rem;
        }
        .editor-toolbar-button-active,
        button.editor-toolbar-button-active {
            color: var(--main);
            background-color: var(--bg-3);
        }
    }
</style>

<div class="flex compact-gap" style="margin-bottom: 0px;">
    <button class="faint editor-toolbar-button {
        activeMarks?.bold ?
            "editor-toolbar-button-active" :
            ""
    }" onclick={() => toggle('bold')} aria-label="Bold">
        <BoldIcon></BoldIcon>
    </button>
    <button class="faint editor-toolbar-button {
        activeMarks?.italic ?
            "editor-toolbar-button-active" :
            ""
    }" onclick={() => toggle('italic')} aria-label="Italic">
        <ItalicIcon></ItalicIcon>
    </button>
    <button class="faint editor-toolbar-button {
        activeMarks?.underline ?
            "editor-toolbar-button-active" :
            ""
    }" onclick={() => toggle('underline')} aria-label="Underline">
        <UnderlineIcon></UnderlineIcon>
    </button>
    <button class="faint editor-toolbar-button {
        activeMarks?.strike ?
            "editor-toolbar-button-active" :
            ""
    }" onclick={() => toggle('strike')} aria-label="Strikethrough">
        <StrikethroughIcon></StrikethroughIcon>
    </button>
    <button class="faint editor-toolbar-button {
        activeMarks?.superscript ?
            "editor-toolbar-button-active" :
            ""
    }" onclick={() => toggle('superscript')} aria-label="Superscript">
        <SuperscriptIcon></SuperscriptIcon>
    </button>
    <button class="faint editor-toolbar-button {
        activeMarks?.subscript ?
            "editor-toolbar-button-active" :
            ""
    }" onclick={() => toggle('subscript')} aria-label="Subscript">
        <SubscriptIcon></SubscriptIcon>
    </button>
    <button class="faint editor-toolbar-button" onclick={
        () => view && undo(view.state, view.dispatch)
    } aria-label="Undo">
        <UndoIcon></UndoIcon>
    </button>
    <button class="faint editor-toolbar-button" onclick={
        () => view && redo(view.state, view.dispatch)
    } aria-label="Redo">
        <RedoIcon></RedoIcon>
    </button>
</div>

<div bind:this={editorDiv} class="container"></div>

