<script>
    import Match from "../../../Match.svelte";

    let { data } = $props();
</script>
<Match local={false} cloudId={data.cloudId} {data}></Match>
