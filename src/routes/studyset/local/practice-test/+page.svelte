<script lang="ts">
    import ReviewMode from "$lib/components/PracticeTest.svelte"
    let { data }: { data: any } = $props();
</script>

<ReviewMode data={{ ...data, local: true }} />
