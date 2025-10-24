<script>
    import { onMount, tick } from "svelte";
    import { slide } from "svelte/transition";
    import {
        computePosition,
        flip,
        shift,
        offset
    } from "@floating-ui/dom";
    let {
        button,
        buttonContent,
        div,
        divContent
    } = $props();
    let buttonEl;
    let divEl;
    let show = $state(false);

    function toggle() {
        show = !show;
        tick().then(update);
    }
    function update() {
        if (show) {
            computePosition(buttonEl, divEl, {
                placement: "bottom",
                middleware: [offset(4), flip(), shift({
                    padding: 10
                })]
            }).then(({x, y}) => {
                Object.assign(divEl.style, {
                    left: `${x}px`,
                    top: `${y}px`
                });
            });
        }
    }
    onMount(() => {
        window.addEventListener("resize", update);
        window.addEventListener("scroll", update);
        return () => {
            window.removeEventListener("resize", update);
            window.removeEventListener("scroll", update);
        }
    })
</script>
<button
    onclick={() => toggle()}
    bind:this={buttonEl}
    {...button}
>
    {@render buttonContent?.()}
</button>
{#if show}
    <div
        transition:slide={{duration: 200}}
        bind:this={divEl}
        {...div}
        class="raw-dropdown {div?.class}"
    >
        {@render divContent?.()}
    </div>
{/if}
