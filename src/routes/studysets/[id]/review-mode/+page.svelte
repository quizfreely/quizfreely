<script>
    import ReviewMode from "$lib/ReviewMode.svelte"
    let { data } = $props();
</script>

<ReviewMode data={{ ...data, local: false }} />
