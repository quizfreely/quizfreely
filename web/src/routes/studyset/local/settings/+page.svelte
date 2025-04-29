<script>
    import ReviewModeSettings from "../../../StudysetSettings.svelte"
    let { data } = $props();
</script>

<ReviewModeSettings data={{ ...data, local: true }} />
