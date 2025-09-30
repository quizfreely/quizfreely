<script>
    import db from "$lib/idb-api-layer/db.js";
    import { onMount } from "svelte";
    import CheckmarkIcon from "$lib/icons/Checkmark.svelte";

    let { data } = $props();
    let localStudyset = $state(null);
    let mins = $state("");
    const DEFAULT_MINS = 10;
    onMount(async () => {
        if (data.localId != null) {
            localStudyset = (
                await db.studysets.where("id").equals(data.localId).toArray()
            )?.[0];
        }
    })
</script>
<div class="grid page">
    <div class="content">
        <h1 class="h3">Host a Review Game</h1>
        {#snippet selectedStudysetInfo(studyset, local)}
            <p>Selected studyset:</p>
            <div class="box">
                <a href={local ?
                    `/studyset/local?id=${studyset.id}` :
                    `/studysets/${studyset.id}`
                }>{studyset.title}</a>
                <p style="margin-top: 0.6rem;">{studyset.termsCount} terms</p>
            </div>
            <a href="/host/pick" class="button alt">Choose a different studyset?</a>
        {/snippet}
        {#if data.studyset != null}
            {@render selectedStudysetInfo(data.studyset, false)}
        {:else if localStudyset != null}
            {@render selectedStudysetInfo(localStudyset, true)}
        {:else}
            <p style="">Pick a studyset or <a href="/explore">search for one</a></p>
            <a href="/host/pick" class="button" style="margin-top: 0.6rem;">Select Studyset</a>
        {/if}
        <p style="margin-top: 2rem;">Select game mode:</p>
        <div class="flex" style="margin-top: 0.6rem;">
            <button class="button-box selected">
                Classic
            </button>
            <button class="button-box" disabled>
                More coming soon
            </button>
        </div>
        <p style="margin-top: 2rem;">Set time to end game after:</p>
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
