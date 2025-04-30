<script>
    import StudysetSettings from "../../../StudysetSettings.svelte"
    let { data } = $props();
</script>

<StudysetSettings data={{ ...data, local: true }} />
