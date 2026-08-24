<script>
    import Edit from "$lib/Edit.svelte";
    let { data } = $props();
</script>

<Edit data={{ ...data, local: true }}/>
