<script lang="ts">
    import StudysetStats from "../../../StudysetStats.svelte"
    let { data } = $props();
</script>

<StudysetStats data={{ ...data, local: false }} />
