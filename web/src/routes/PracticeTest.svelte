<script>
    import { onMount } from "svelte";
    import idbApiLayer from "$lib/idb-api-layer/idb-api-layer.js";
    import BackIcon from "$lib/icons/BackArrow.svelte";
    let { data } = $props();
    let terms = $state();

    function shuffleArray(ogArray) {
        let arr = [...ogArray];
        for (let index = arr.length - 1; index > 0; index--) {
            const randomIndex = Math.floor(Math.random() * (index + 1));
            [arr[index], arr[randomIndex]] = [arr[randomIndex], arr[index]];
        }
        return arr;
    }

    if (!data.local) {
        terms = shuffleArray(data?.studyset?.terms);
    }
    onMount(() => {
        if (data.local) {
            (async () => {
                const studyset = await idbApiLayer.getStudysetById(data.localId, {
                    terms: {
                        progress: true
                    }
                })
                terms = shuffleArray(studyset.terms);
            })();
        }
    })

    let eachRandom;
    function newEachRandom() {
        eachRandom = Math.random();
        return eachRandom;
    }
</script>
<div class="grid page">
    <div class="content">
        <div class="flex" style="margin-top: 1rem;">
            <a class="button faint" href={data.local ?
                `/studyset/local?id=${data.localId}` :
                `/studysets/${data.studysetId}`
            }><BackIcon></BackIcon> Back</a>
        </div>
        <h1></h1>
        <p style="white-space: pre-wrap">{JSON.stringify(terms, null, 4)}</p>
        {#each terms as term}
            {#if newEachRandom() < 0.5}
                e
            {:else}
                a
            {/if}
        {/each}
    </div>
</div>
