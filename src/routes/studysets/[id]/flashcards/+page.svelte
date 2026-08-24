<script>
    import FlashcardsPage from "$lib/FlashcardsPage.svelte";

    let { data } = $props();
</script>
<FlashcardsPage local={false} cloudId={data.cloudId} {data}></FlashcardsPage>
