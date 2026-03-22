<script lang="ts">
    import Edit from "../../Edit.svelte";
    let { data }: { data: any } = $props();
</script>

<Edit data={{ ...data, new: true }}/>
