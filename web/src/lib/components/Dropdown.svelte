<script>
    import { slide } from "svelte/transition";
    let {
        button,
        buttonContent,
        div,
        divContent
    } = $props();
    let buttonElement;
    let divElement;
    let show = $state(false);
</script>
<button onclick={() => show = !show} {...button}>
    {@render buttonContent?.()}
</button>
{#if show}
<div transition:slide={{duration: 200}} {...div} class="raw-dropdown {div?.class}">
    {@render divContent?.()}
</div>
{/if}
