<script>
    import Noscript from "$lib/components/Noscript.svelte";
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
</style>

<svelte:head>
    <title>Quizfreely Classes</title>
</svelte:head>

<Noscript />
<main>
    <div class="grid page">
        <div class="content">
            {#if data?.classesData?.classesAsTeacher?.length > 0}
                <div class="grid list">
                    {#each data.classesData.classesAsTeacher as classobj}
                        <div class="box">
                            <a class="class-link" href="/classes/c/{classobj.id}">{classobj.name}</a>
                        </div>
                    {/each}
                </div>
            {/if}
            {#if data?.classesData?.classesAsStudent?.length > 0}
                <div class="grid list">
                    {#each data.classesData.classesAsStudent as classobj}
                        <div class="box">
                            <a class="class-link" href="/classes/c/{classobj.id}">{classobj.name}</a>
                        </div>
                    {/each}
                </div>
            {/if}
            {#if !(data?.classesData?.classesAsStudent?.length > 0)}
                a
            {/if}
            <p style="white-space: pre">
            {JSON.stringify(
                data.classesData,
                null,
                4
            )}
            </p>
        </div>
    </div>
</main>

