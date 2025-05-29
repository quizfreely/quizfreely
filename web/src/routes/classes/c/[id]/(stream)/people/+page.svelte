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
    <p>{data?.classData?.classById?.classCode}</p>
    <p>
    {#if data?.classData?.classById?.teachers?.length == 1}
    {data?.classData?.classById?.teachers?.length} Teacher
    {:else}
    {data?.classData?.classById?.teachers?.length} Teachers
    {/if}
    </p>
    {#each data?.classData?.classById?.teachers as teacher}
        <div class="box">
        {teacher.displayName}
        </div>
    {/each}
    <p>
    {#if data?.classData?.classById?.students?.length == 1}
    {data?.classData?.classById?.students?.length} Student
    {:else}
    {data?.classData?.classById?.students?.length} Students
    {/if}
    </p>
    {#each data?.classData?.classById?.students as student}
        <div class="box">
            {student.displayName}
        </div>
    {/each}
    <!-- <p style="white-space: pre-wrap;"> -->
    <!-- {JSON.stringify( -->
    <!--     data.classData, -->
    <!--     null, -->
    <!--     4 -->
    <!-- )} -->
    <!-- </p> -->
</div>

