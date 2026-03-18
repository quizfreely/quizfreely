<script lang="ts">
    import PracticeTest from "$lib/components/PracticeTest.svelte"
    let { data }: { data: any } = $props();
</script>

<PracticeTest data={{ ...data, local: false, alreadyOver: true }} />
