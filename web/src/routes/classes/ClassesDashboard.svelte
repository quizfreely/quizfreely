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
.split-style-container-thing {
    display: grid;
    gap: 0px;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto;
}
.split-style-container-thing .left-div {
    justify-self: end;
    margin-top: 0px;
    padding: 1rem;
    border-right: 0.1rem solid var(--bg4);
}
.split-style-container-thing .right-div {
    justify-self: start;
    margin-top: 0px;
    padding: 1rem;
    border-left: 0.1rem solid var(--bg4);
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
            {#if !(data?.classesData?.classesAsStudent?.length > 0 || data?.classesData?.classesAsTeacher?.length > 0)}
                <div class="split-style-container-thing">
                    <div class="left-div">
                        <h2 class="h3">Students</h2>
                    </div>
                    <div class="right-div">
                        <h2 class="h3">Teachers</h2>
                    </div>
                </div>
            {/if}
            <!-- <p style="white-space: pre"> -->
            <!-- {JSON.stringify( -->
            <!--     data.classesData, -->
            <!--     null, -->
            <!--     4 -->
            <!-- )} -->
            <!-- </p> -->
        </div>
    </div>
</main>

