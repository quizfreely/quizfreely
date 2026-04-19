<script>
    import TermStats from "../../../../TermStats.svelte";
    let { data } = $props();
</script>

<TermStats data={{ ...data, local: true }} />
