<script>
    import Noscript from "$lib/components/Noscript.svelte";
    let { data } = $props();
</script>

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
                            <p>{classobj.name}</p>
                        </div>
                    {/each}
                </div>
            {/if}
            {#if data?.classesData?.classesAsStudent?.length > 0}
                <div class="grid list">
                    {#each data.classesData.classesAsStudent as classobj}
                        <div class="box">
                            <p>{classobj.name}</p>
                        </div>
                    {/each}
                </div>
            {/if}
            {JSON.stringify(
                data.classesData
            )}
        </div>
    </div>
</main>

