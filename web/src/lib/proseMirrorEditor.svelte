<script>
  import { onMount, onDestroy } from 'svelte';
  import { createEditor } from '$lib/proseMirrorEditor.js';

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
  .ProseMirror {
    border: 1px solid #ccc;
    padding: 8px;
    min-height: 100px;
  }
</style>

<button on:click={() => toggle('bold')}>Bold</button>
<button on:click={() => toggle('italic')}>Italic</button>
<button on:click={() => toggleHeading(1)}>H1</button>

<div bind:this={editorDiv} class="ProseMirror" />

