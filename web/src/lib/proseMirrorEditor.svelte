<script>
    import { onMount, onDestroy } from 'svelte';
    import { createEditor } from '$lib/proseMirrorEditor.js';
    import 'prosemirror-view/style/prosemirror.css';
    import BoldIcon from "$lib/icons/Bold.svelte";
    import ItalicIcon from "$lib/icons/Italic.svelte";
    import UnderlineIcon from "$lib/icons/Underline.svelte";
    import StrikethroughIcon from "$lib/icons/Strikethrough.svelte";
    import SuperscriptIcon from "$lib/icons/Superscript.svelte";
    import SubscriptIcon from "$lib/icons/Subscript.svelte";
  let { placeholder } = $props();

  let editorDiv;
  let view;
  let activeMarks = $state({});
  function updateActiveMarksFunc(marks) {
    activeMarks = marks;
  }

  onMount(() => {
    view = createEditor(editorDiv, placeholder, updateActiveMarksFunc);

    return () => {
      view.destroy();
    };
  });

  onDestroy(() => {
    view?.destroy();
  });
  import { schema } from '$lib/proseMirrorEditor.js';
  import { toggleMark, setBlockType } from 'prosemirror-commands';
function toggleBlockType(nodeType, attrs = {}) {
  return function (state, dispatch) {
    const isActive = state.selection.$from.parent.hasMarkup(nodeType, attrs);
    return isActive
      ? setBlockType(state.schema.nodes.paragraph)(state, dispatch)
      : setBlockType(nodeType, attrs)(state, dispatch);
  };
}
  function toggle(mark) {
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

  function toggleHeading(level) {
    toggleBlockType(schema.nodes.heading, { level })(view.state, view.dispatch);
    view.focus();
  }
</script>

<style>
    :global {
        .ProseMirror {
            margin-top: 0.4rem;
        }
        .ProseMirror .placeholder {
          position: absolute;
          color: var(--fg0);
          pointer-events: none;
          user-select: none;
        }
        .ProseMirror > div {
            border-radius: 0.8rem;
            border: 0.2rem solid var(--bg4);
            padding: 0.8rem;
            min-height: 4rem;
        }
        .ProseMirror:focus-visible {
            outline: none;
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
            background-color: var(--bg3);
        }
    }
</style>

<div class="flex compact-gap" style="margin-bottom: 0px;">
    <button class="faint editor-toolbar-button {
        activeMarks?.bold ?
            "editor-toolbar-button-active" :
            ""
    }" on:click={() => toggle('bold')} aria-label="Bold">
        <BoldIcon></BoldIcon>
    </button>
    <button class="faint editor-toolbar-button {
        activeMarks?.italic ?
            "editor-toolbar-button-active" :
            ""
    }" on:click={() => toggle('italic')} aria-label="Italic">
        <ItalicIcon></ItalicIcon>
    </button>
    <button class="faint editor-toolbar-button {
        activeMarks?.underline ?
            "editor-toolbar-button-active" :
            ""
    }" on:click={() => toggle('underline')} aria-label="Underline">
        <UnderlineIcon></UnderlineIcon>
    </button>
    <button class="faint editor-toolbar-button {
        activeMarks?.strike ?
            "editor-toolbar-button-active" :
            ""
    }" on:click={() => toggle('strike')}>
        <StrikethroughIcon></StrikethroughIcon>
    </button>
    <button class="faint editor-toolbar-button {
        activeMarks?.superscript ?
            "editor-toolbar-button-active" :
            ""
    }" on:click={() => toggle('superscript')}>
        <SuperscriptIcon></SuperscriptIcon>
    </button>
    <button class="faint editor-toolbar-button {
        activeMarks?.subscript ?
            "editor-toolbar-button-active" :
            ""
    }" on:click={() => toggle('subscript')}>
        <SubscriptIcon></SubscriptIcon>
    </button>
</div>

<div bind:this={editorDiv} class="ProseMirror" />

