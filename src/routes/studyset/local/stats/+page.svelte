<script>
    import StudysetStats from "../../../StudysetStats.svelte"
    let { data } = $props();
</script>

<StudysetStats data={{ ...data, local: true }} />
