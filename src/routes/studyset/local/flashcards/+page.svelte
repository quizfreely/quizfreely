<script>
    import FlashcardsPage from "../../../FlashcardsPage.svelte";

    let { data } = $props();
</script>
<FlashcardsPage local={true} localId={data.localId}></FlashcardsPage>