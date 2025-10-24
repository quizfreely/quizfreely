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
        divContent,
        computePositionOptions
    } = $props();
    let buttonEl;
    let divEl;
    let show = $state(false);

    function toggle() {
        show = !show;
        if (show) {
            document.addEventListener("click", outsideClickHandler);
        } else {
            cleanUpOutsideClickHandler();
        }
        tick().then(update);
    }
    function update() {
        if (show) {
            computePosition(buttonEl, divEl, {
                placement: "bottom",
                ...computePositionOptions,
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
    function outsideClickHandler(e) {
        if (!buttonEl.contains(e.target) && !divEl.contains(e.target)) {
            show = false;
            cleanUpOutsideClickHandler();
        }
    }
    function cleanUpOutsideClickHandler() {
        document.removeEventListener("click", outsideClickHandler);
    }
    onMount(() => {
        window.addEventListener("resize", update);
        window.addEventListener("scroll", update);
        return () => {
            window.removeEventListener("resize", update);
            window.removeEventListener("scroll", update);
            cleanUpOutsideClickHandler();
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
