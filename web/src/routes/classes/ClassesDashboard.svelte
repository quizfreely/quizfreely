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
    margin-right: 0px;
    padding-left: 1rem;
    padding-bottom: 1rem;
    padding-top: 1rem;
    padding-right: 4rem;
    border-right: 0.2rem solid var(--bg4);
}
.split-style-container-thing .right-div {
    justify-self: start;
    margin-top: 0px;
    margin-left: 0px;
    padding-left: 3.9rem;
    padding-bottom: 1rem;
    padding-top: 1rem;
    padding-right: 1rem;
}
.split-style-container-thing {
    text-align: center;
}
.split-style-container-thing ::placeholder {
    text-align: center;
}
@media only screen and (max-width: 800px) {
    .split-style-container-thing {
        display: grid;
        gap: 0px;
        grid-template-columns: auto;
        grid-template-rows: 1fr 1fr;
    }
    .split-style-container-thing .left-div {
        justify-self: center;
        border-right: none;
        margin-top: 0px;
        padding-left: 2rem;
        padding-bottom: 2rem;
        padding-top: 2rem;
        padding-right: 2rem;
    }
    .split-style-container-thing .right-div {
        justify-self: center;
        margin-top: 0px;
        margin-left: 0px;
        padding-left: 2rem;
        padding-bottom: 2rem;
        padding-top: 2rem;
        padding-right: 2rem;
    }
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
                        <h3>Students</h3>
                        <div style="display: flex; flex-direction: column; gap: 1rem;">
                            <input type="text" placeholder="Enter Class Code" style="width: 14rem;">
                            <button style="width: 14rem; margin-top: 0px;">Join</button>
                        </div>
                    </div>
                    <div class="right-div">
                        <h3>Teachers</h3>
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

