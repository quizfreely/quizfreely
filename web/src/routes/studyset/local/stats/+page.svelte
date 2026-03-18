<script lang="ts">
    import StudysetStats from "../../../StudysetStats.svelte"
    let { data }: { data: any } = $props();
</script>

<StudysetStats data={{ ...data, local: true } as any} />
