<script>
    import { onMount } from "svelte";
    import Flashcards from "$lib/components/Flashcards.svelte";
    import { idbApiLayer } from "$lib/idb-api-layer";
    import BackArrow from "$lib/icons/BackArrow.svelte";

    let { data, local, localId, cloudId } = $props();
    let terms = $state(data.terms);
    if (local) {
        onMount(() => {
            (async () => {
                terms = await idbApiLayer.getTermsByStudysetId(localId, {
                    termImageUrl: true,
                    defImageUrl: true
                });
            })();
        });
    }
</script>
<div class="flex">
    {#if local}
        <a href="/studyset/local?id={localId}" class="button faint"><BackArrow /> Back</a>
    {:else}
        <a href="/studysets/{cloudId}" class="button faint"><BackArrow /> Back</a>
    {/if}
</div>
{#if terms?.length > 0}
    <Flashcards {terms}></Flashcards>
{/if}