<script>
    import idbApiLayer from "$lib/idb-api-layer/idb-api-layer.js";
    let { data } = $props();
    let terms = $state();
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
</script>
<p>{JSON.stringify(terms, undefined, 4)}</p>
