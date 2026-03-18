<script lang="ts">
    import StudysetPage from "../../StudysetPage.svelte";
    let { data }: { data: any } = $props();
</script>

<StudysetPage data={{ ...data, local: false }}/>
