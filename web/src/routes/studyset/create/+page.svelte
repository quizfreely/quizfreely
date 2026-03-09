<script lang="ts">
    import Edit from "../../Edit.svelte";
    let { data } = $props();
</script>

<Edit data={{ ...data, new: true }}/>
