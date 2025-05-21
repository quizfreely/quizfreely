<script>
    import Noscript from "$lib/components/Noscript.svelte";
    import { onMount } from "svelte";
    import ProseMirrorEditor from "$lib/proseMirrorEditor.svelte";
    let { data } = $props();

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
    color: var(--fg1);
}
.class-link:hover {
    color: var(--fg0);
}
</style>
<svelte:head>
    <title>Quizfreely Classes</title>
</svelte:head>

<Noscript />
<main>
    <div class="grid page">
        <div class="content">
            <ProseMirrorEditor placeholder="Post an announcement"></ProseMirrorEditor>
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

