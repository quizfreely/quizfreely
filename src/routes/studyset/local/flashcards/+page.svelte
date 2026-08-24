<script>
    import FlashcardsPage from "$lib/FlashcardsPage.svelte";

    let { data } = $props();
</script>
<FlashcardsPage local={true} localId={data.localId} {data}></FlashcardsPage>
