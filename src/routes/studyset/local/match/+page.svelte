<script>
    import Match from "../../../Match.svelte";

    let { data } = $props();
</script>
<Match local={true} localId={data.localId} {data}></Match>
