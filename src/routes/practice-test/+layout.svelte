<script>
    import { page } from "$app/state";
    import { fade } from "svelte/transition";
    import { sineIn, sineOut } from "svelte/easing";
    let { children } = $props();
    const r = $derived(page.url.searchParams.get("r") ?? 0)
</script>
{#key r}
    <div in:fade={{ duration: 120, delay: 120, easing: sineIn }} out:fade={{ duration: 120, easing: sineOut }}>
        {@render children()}
    </div>
{/key}
