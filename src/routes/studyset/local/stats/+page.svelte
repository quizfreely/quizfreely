<script>
    import StudysetStats from "$lib/StudysetStats.svelte"
    let { data } = $props();
</script>

<StudysetStats data={{ ...data, local: true }} />
