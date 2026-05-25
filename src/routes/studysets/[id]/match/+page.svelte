<script>
    import Match from "../../../Match.svelte";

    let { data } = $props();
    console.log("logged data", data)
</script>
<Match local={false} cloudId={data.cloudId} {data}></Match>
