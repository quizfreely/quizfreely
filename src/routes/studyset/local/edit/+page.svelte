<script lang="ts">
    import Edit from "$lib/components/Edit.svelte";
    let { data }: { data: any } = $props();
</script>

<Edit data={{ ...data, local: true }}/>
