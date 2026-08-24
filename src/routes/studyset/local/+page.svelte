<script>
    import StudysetPage from "$lib/StudysetPage.svelte";
    let { data } = $props();
</script>

<StudysetPage data={{ ...data, local: true }}/>
