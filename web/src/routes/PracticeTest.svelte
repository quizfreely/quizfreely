<script>
    import { onMount } from "svelte";
    import idbApiLayer from "$lib/idb-api-layer/idb-api-layer.js";
    let { data } = $props();
    let terms = $state();
    if (!data.local) {
        terms = data?.studyset?.terms;
    }
    onMount(() => {
        if (data.local) {
            (async () => {
                const studyset = await idbApiLayer.getStudysetById(data.localId, {
                    terms: {
                        progress: true
                    }
                })
                terms = studyset.terms;
            })();
        }
    })
</script>
<p style="white-space: pre-wrap">{JSON.stringify(terms, null, 4)}</p>
