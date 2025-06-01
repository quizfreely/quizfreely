<script>
    import AssignmentsListItem from "$lib/classes/AssignmentsListItem.svelte";
    import Noscript from "$lib/components/Noscript.svelte";
    // import { onMount } from "svelte";
    // import { invalidateAll } from '$app/navigation';
    // import { fancyTimestamp } from "$lib/fancyTimestamp.js";
    import IconPencil from "$lib/icons/Pencil.svelte";
    let { data } = $props();
    let newAnnouncementContent = $state({});
    let announcementProseMirrorEditor;
    let amIATeacher = data?.classData?.classById?.teachers?.some(
        teacher => data?.authedUser?.id == teacher?.id
    );
</script>
<style>
.class-box {
    display: flex;
    gap: 0px;
    border-radius: 0.8rem;
}
.class-link {
    color: var(--fg-1);
}
.class-link:hover {
    color: var(--fg-0);
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
        <AssignmentsListItem title={draft.title} renderedDueDate={draft.renderedDueDate} amIATeacher hideTeacherViewButton="true" trustedEditHref="/classes/c/{ data.classId }/edit-assignment-draft/{ draft.id }" descriptionSafeHtml={draft.safeRenderedHtml}></AssignmentsListItem>
    {/each}
    {/if}
    {#if data?.classData?.classById?.assignments?.length > 0}
    <p>Assignments</p>
    {#each data?.classData?.classById?.assignments as assignment}
        <AssignmentsListItem title={assignment.title} renderedDueDate={assignment.renderedDueDate} amIATeacher trustedViewHref="/classes/c/{ data.classId }/assignments/{ assignment.id }" trustedEditHref="/classes/c/{ data.classId }/edit-assignment/{ assignment.id }" descriptionSafeHtml={assignment.safeRenderedHtml}></AssignmentsListItem>
    {/each}
    {/if}
    <!-- <p style="white-space: pre-wrap;"> -->
    <!-- {JSON.stringify( -->
    <!--     data.classData, -->
    <!--     null, -->
    <!--     4 -->
    <!-- )} -->
    <!-- </p> -->
</div>

