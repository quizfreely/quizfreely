<script lang="ts">
    import Dashboard from "./dashboard/+page.svelte";
    import LandingPage from "./landing-page/+page.svelte";
    let { data }: { data: any } = $props();
</script>

{#if data?.dashboard == true}
<Dashboard data={ data } />
{:else}
<LandingPage data={ data } />
{/if}
