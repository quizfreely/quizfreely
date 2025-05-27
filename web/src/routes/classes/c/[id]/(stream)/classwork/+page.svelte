<script>
    import Noscript from "$lib/components/Noscript.svelte";
    // import { onMount } from "svelte";
    // import { invalidateAll } from '$app/navigation';
    // import { fancyTimestamp } from "$lib/fancyTimestamp.js";
    import IconPencil from "$lib/icons/Pencil.svelte";
    let { data } = $props();
    let newAnnouncementContent = $state({});
    let announcementProseMirrorEditor;
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
    {#if data?.classData?.classById?.assignmentDrafts?.length > 0}
    Drafts <span class="fg0">(not visible to students)</span>
    {#each data?.classData?.classById?.assignmentDrafts as draft}
        <div class="box announcement">
            <p style="font-size: 1.2rem;">{draft.title}</p>
            <div class="flex" style="align-items: center; margin-top: 0.4rem;">
                <a href="/classes/c/{data.classId}/edit-assignment-draft/{draft.id}" class="button faint" style="margin-top: 0px;">
                    <IconPencil></IconPencil>
                    Edit
                </a>
            {#if draft.renderedDueDate}
                <span class="fg0" style="margin-left: auto; margin-right: 1rem;">Due {draft.renderedDueDate}</span>
            {/if}
            </div>
        </div>
    {/each}
    {/if}
    {#each data?.classData?.classById?.announcements as announcement}
        {#if announcement.safeRenderedHtml}
        <div class="box announcement">
            <p>{announcement.user.displayName} · {announcement.renderedTimestamp}</p>
            {@html announcement.safeRenderedHtml}
        </div>
        {/if}
    {/each}
    <p style="white-space: pre-wrap;">
    {JSON.stringify(
        data.classData,
        null,
        4
    )}
    </p>
</div>

