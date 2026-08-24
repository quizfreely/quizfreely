<script>
    import PracticeTest from "$lib/PracticeTest.svelte"
    let { data } = $props();
</script>

<PracticeTest data={{ ...data, local: false }} />
