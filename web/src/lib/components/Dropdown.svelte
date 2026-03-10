<script lang="ts">
    import { onMount, tick } from "svelte";
    import { slide } from "svelte/transition";
    import {
        computePosition,
        flip,
        shift,
        offset,
        autoUpdate,
    } from "@floating-ui/dom";
    let {
        button,
        buttonContent,
        div = {},
        divContent,
        container = {},
        ...props /*
            offset,
            shiftPadding,
            placement
        */
    } = $props();
    let buttonEl: HTMLButtonElement;
    let divEl: HTMLDivElement | undefined = $state();
    let show = $state(false);

    let cleanUpAutoUpdate: () => void;
    function hide() {
        show = false;
        cleanUp();
    }
    function toggle() {
        show = !show;
        if (show) {
            document.addEventListener("click", outsideClickHandler);
            tick().then(() => {
                if (divEl !== undefined) {
                    cleanUpAutoUpdate = autoUpdate(buttonEl, divEl, update);
                }
            });
        } else {
            cleanUp();
        }
    }
    function update() {
        if (show && divEl !== undefined) {
            computePosition(buttonEl, divEl, {
                placement: props?.placement ?? "bottom-start",
                middleware: [
                    offset(props?.offset ?? 4),
                    flip(),
                    shift({
                        padding: props?.shiftPadding ?? 10,
                    }),
                ],
            }).then(({ x, y }) => {
                if (divEl !== undefined) {
                    Object.assign(divEl.style, {
                        left: `${x}px`,
                        top: `${y}px`,
                    });
                }
            });
        }
    }
    function outsideClickHandler(e: PointerEvent) {
        if (
            e.target instanceof Node &&
            !buttonEl.contains(e.target) &&
            !divEl?.contains(e.target)
        ) {
            show = false;
            cleanUpOutsideClickHandler();
        }
    }
    function cleanUpOutsideClickHandler() {
        document.removeEventListener("click", outsideClickHandler);
    }
    function cleanUp() {
        cleanUpOutsideClickHandler();
        cleanUpAutoUpdate?.();
    }
    onMount(() => {
        return cleanUp;
    });
</script>

<div {...container}>
    <button onclick={() => toggle()} bind:this={buttonEl} {...button}>
        {@render buttonContent?.()}
    </button>
    {#if show}
        <div
            transition:slide={{ duration: 200 }}
            bind:this={divEl}
            {...div}
            class="raw-dropdown qzfr-raw-dropdown {div?.class}"
            onintrostart={update}
            onintroend={update}
        >
            {@render divContent?.(hide)}
        </div>
    {/if}
</div>

<style>
    .qzfr-raw-dropdown {
        position: absolute;
        width: max-content;
        top: 0;
        left: 0;
    }
</style>
