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

  let editorDiv;
  let view;

  onMount(() => {
    view = createEditor(editorDiv);

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
    toggleMark(schema.marks[mark])(view.state, view.dispatch);
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
            margin-top: 0.2rem;
        }
        .ProseMirror > div {
            border-radius: 0.8rem;
            border: 0.2rem solid var(--main);
            padding: 8px;
            min-height: 4rem;
        }
        .ProseMirror:focus-visible {
            outline: none;
        }
        .editor-toolbar-button {
            border-radius: 0.8rem;
        }
    }
</style>

<div class="flex compact-gap" style="margin-bottom: 0px;">
    <button class="faint editor-toolbar-button" on:click={() => toggle('bold')} aria-label="Bold">
        <BoldIcon></BoldIcon>
    </button>
    <button class="faint editor-toolbar-button" on:click={() => toggle('italic')} aria-label="Italic">
        <ItalicIcon></ItalicIcon>
    </button>
    <button class="faint editor-toolbar-button" on:click={() => toggle('underline')} aria-label="Underline">
        <UnderlineIcon></UnderlineIcon>
    </button>
    <button class="faint editor-toolbar-button" on:click={() => toggle('strike')}>
        <StrikethroughIcon></StrikethroughIcon>
    </button>
    <button class="faint editor-toolbar-button" on:click={() => toggle('superscript')}>
        <SuperscriptIcon></SuperscriptIcon>
    </button>
    <button class="faint editor-toolbar-button" on:click={() => toggle('subscript')}>
        <SubscriptIcon></SubscriptIcon>
    </button>
</div>

<div bind:this={editorDiv} class="ProseMirror" />

