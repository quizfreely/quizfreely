<script>
    import Noscript from "$lib/components/Noscript.svelte";
    import { onMount } from "svelte";
    import ProseMirrorEditor from "$lib/proseMirrorEditor.svelte";
    let { data } = $props();
    let newAnnouncementContent;
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
</style>
<svelte:head>
    <title>Quizfreely Classes</title>
</svelte:head>

<Noscript />
<main style="margin-top: 0px;">
    <div class="grid page">
        <div class="content">
            <ProseMirrorEditor placeholder="Post an announcement" bind:value={newAnnouncementContent} ></ProseMirrorEditor>
            <div class="flexbox-to-the-end">
                <button onclick={function () {
                    console.log(newAnnouncementContent);
                }}>Post</button>
            </div>
            <p style="white-space: pre">
            {JSON.stringify(
                data.classData,
                null,
                4
            )}
            </p>
        </div>
    </div>
</main>

