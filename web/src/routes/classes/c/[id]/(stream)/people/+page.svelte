<script>
    import Noscript from "$lib/components/Noscript.svelte";
    import { onMount } from "svelte";
    import { invalidateAll } from '$app/navigation';
    import ProseMirrorEditor from "$lib/proseMirrorEditor.svelte";
    import { DOMSerializer, Node } from "prosemirror-model";
    import { schema } from "$lib/proseMirrorSchema.js";
    let { data } = $props();
</script>
<style>
.class-box {
    display: flex;
    gap: 0px;
    border-radius: 0.8rem;
}
.class-link {
    color: var(--fg1);
}
.class-link:hover {
    color: var(--fg0);
}
.flexbox-to-the-end {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
}
:global {
    .announcement p {
        margin-top: 0px;
    }
}
</style>
<svelte:head>
    <title>Quizfreely Classes</title>
</svelte:head>

<Noscript />
<div style="margin-top: 0px;">
    <p style="white-space: pre-wrap;">
    {JSON.stringify(
        data.classData,
        null,
        4
    )}
    </p>
</div>

