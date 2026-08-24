<script>
    import TermStats from "$lib/TermStats.svelte";
    let { data } = $props();
</script>

<TermStats data={{ ...data, local: true }} />
