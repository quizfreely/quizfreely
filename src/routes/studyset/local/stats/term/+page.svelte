<script lang="ts">
    import TermStats from "../../../../TermStats.svelte";
    let { data }: { data: any } = $props();
</script>

<TermStats data={{ ...data, local: true }} />
