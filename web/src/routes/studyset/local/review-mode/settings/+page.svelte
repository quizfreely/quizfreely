<script>
    import ReviewModeSettings from "../../../ReviewModeSettings.svelte"
    let { data } = $props();
</script>

<ReviewModeSettings data={{ ...data, local: true }} />
