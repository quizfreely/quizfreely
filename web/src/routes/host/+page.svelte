<script>
    import db from "$lib/idb-api-layer/db.js";
    import { onMount } from "svelte";

    let { data } = $props();
    let localStudyset = $state(null);
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
            <p>You can pick one of your studysets or <a href="/explore">search for one</a></p>
            <a href="/host/pick" class="button alt">Select Studyset</a>
        {/if}
    </div>
</div>
