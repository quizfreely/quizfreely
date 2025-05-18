<script>
    import ClassesDashboard from "./ClassesDashboard.svelte";
    import ClassesFeature from "./features/+page.svelte";
    import ClassesLandingPage from "./landing-page/+page.svelte";
    let { data } = $props();
</script>

{#if data?.classesPage == "dashboard"}
<ClassesDashboard data={ data } />
{:else if data?.classesPage == "feature"}
<ClassesFeature data={ data } />
{:else} <!-- data?.classesPage == "landing" -->
<ClassesLandingPage data={ data } />
{/if}
