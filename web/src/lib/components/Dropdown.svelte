<script>
    import { onMount, tick } from "svelte";
    import { slide } from "svelte/transition";
    import {
        computePosition,
        flip,
        shift,
        offset,
        autoUpdate
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

    let cleanUpAutoUpdate;
    function toggle() {
        show = !show;
        if (show) {
            document.addEventListener("click", outsideClickHandler);
            tick().then(() => {
                cleanUpAutoUpdate = autoUpdate(
                    buttonEl, divEl, update
                )
            });
        } else {
            cleanUpOutsideClickHandler();
            cleanUpAutoUpdate?.();
        }
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
        return () => {
            cleanUpOutsideClickHandler();
            cleanUpAutoUpdate?.();
        }
    });
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
        onintrostart={update /* compute position before animation */}
        onintroend={update /* compute again after animation */}
    >
        {@render divContent?.()}
    </div>
{/if}
