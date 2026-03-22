<script lang="ts">
    import ReviewMode from "../../../PracticeTest.svelte"
    let { data }: { data: any } = $props();
</script>

<ReviewMode data={{ ...data, local: true }} />
