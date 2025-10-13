<script>
    import db from "$lib/idb-api-layer/db.js";
    import idbApiLayer from "$lib/idb-api-layer/idb-api-layer.js";
    import { onMount } from "svelte";
    import StudysetLinkBox from "$lib/components/StudysetLinkBox.svelte";
    import CheckmarkIcon from "$lib/icons/Checkmark.svelte";

    let { data } = $props();
    let localStudyset = $state(null);
    let mins = $state("");
    const DEFAULT_MINS = 20;
    onMount(async () => {
        if (data.localId != null) {
            localStudyset = (
                await db.studysets.where("id").equals(data.localId).toArray()
            )?.[0];
            localStudyset.termsCount = (await idbApiLayer.getTermsByStudysetId(data.localId))?.length ?? 0;
        }
    })
</script>
<div class="grid page">
    <div class="content">
        <h1 class="h3">Host a Review Game</h1>
        {#if data.studyset != null || localStudyset != null}
            <p>Selected studyset:</p>
            <StudysetLinkBox
                studyset={data.studyset ?? localStudyset}
                linkTemplateFunc={(id) => (
                    data.studyset != null ?
                        `/studysets/${id}` :
                        `/studyset/local?id=${id}`
                )}
            ></StudysetLinkBox>
            <a href="/host/pick" class="button alt">Choose a different studyset?</a>
        {:else}
            <p style="">Pick a studyset or <a href="/explore">search for one</a></p>
            <a href="/host/pick" class="button" style="margin-top: 0.6rem;">Select Studyset</a>
        {/if}
        <p style="margin-top: 2rem;">Set time limit:</p>
        <div class="flex compact-gap" style="margin-top: 0.6rem; align-items: center;">
            <input type="text" placeholder="{DEFAULT_MINS}" bind:value={mins} style="max-width: 6rem;">
            <span>minutes</span>
        </div>
        <a href="/host/play?{data.studysetId != null ?
            `studysetId=${data.studysetId}` :
            `localId=${data.studysetId}`
        }&t={parseInt(mins) || DEFAULT_MINS}" class="button"><CheckmarkIcon></CheckmarkIcon> Start</a>
    </div>
</div>
