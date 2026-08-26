<script>
    import { page } from "$app/state";
    let { children } = $props();
    let r = $derived(page.url.searchParams.get("r") ?? 0)
</script>
{#key r}
    {@render children()}
{/key}
