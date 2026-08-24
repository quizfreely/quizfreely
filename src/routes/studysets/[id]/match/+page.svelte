<script>
    import Match from "$lib/Match.svelte";

    let { data } = $props();
</script>
<Match local={false} cloudId={data.cloudId} {data}></Match>
