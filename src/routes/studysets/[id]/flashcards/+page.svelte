<script>
    import FlashcardsPage from "../../../FlashcardsPage.svelte";

    let { data } = $props();
</script>
<FlashcardsPage local={false} cloudId={data.cloudId} {data}></FlashcardsPage>