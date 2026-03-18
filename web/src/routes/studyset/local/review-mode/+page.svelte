<script lang="ts">
    import ReviewMode from "../../../ReviewMode.svelte"
    let { data }: { data: any } = $props();
</script>

<ReviewMode data={{ ...data, local: true }} />
