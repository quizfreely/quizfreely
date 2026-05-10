<script>
    import { onMount } from "svelte";
    import { fly } from "svelte/transition";
    import IconArrowLeft from "$lib/icons/ArrowLeft.svelte";
    import IconArrowRight from "$lib/icons/ArrowRight.svelte";
    import IconBackArrow from "$lib/icons/BackArrow.svelte";

    let {
        termsList = true,
        terms,
        term,
        nextFunc,
        prevFunc,
        showPrompt = false,
        prompt
    } = $props();

    let defSide = $state(false);
    let index = $state(0);
    let direction = $state(1);

    function flip() {
        if (showPrompt) {
            return;
        }
        defSide = !defSide;
    }
    function prev() {
        if (showPrompt) {
            return;
        }
        if (termsList && index > 0) {
            direction = -1;
            index -= 1;
            defSide = false;
        }
        if (prevFunc) {
            prevFunc();
        }
    }
    function next() {
        if (showPrompt) {
            return;
        }
        if (termsList && index < terms?.length - 1) {
            direction = 1;
            index += 1;
            defSide = false;
        }
        if (nextFunc) {
            nextFunc();
        }
    }

    onMount(function () {
        function flashcardsOnKeyDown(e) {
            const active = document.activeElement;
            if (
                active &&
                (active.tagName === "INPUT" ||
                    active.tagName === "TEXTAREA" ||
                    active.isContentEditable)
            ) {
                return;
            }

            switch (e.key) {
                case "ArrowLeft":
                case "h":
                case "j":
                    prev();
                    break;
                case "ArrowRight":
                case "l":
                case "k":
                    next();
                    break;
                case " " /* space */:
                    /* prevent scrolling,
                    but don't flip here in keydown,
                    to avoid spam-flipping */
                    e.preventDefault();

                /* next/prev is in keydown to allow spamming to move quickly,
                flip is in keyup to prevent spam reflipping */
            }
        }
        function flashcardsOnKeyUp(e) {
            const active = document.activeElement;
            if (
                active &&
                (active.tagName === "INPUT" ||
                    active.tagName === "TEXTAREA" ||
                    active.isContentEditable)
            ) {
                return;
            }

            if (e.key == " ") {
                /* flip in keyup to only flip once */
                e.preventDefault();
                flip();
            }
        }

        window.addEventListener("keydown", flashcardsOnKeyDown);
        window.addEventListener("keyup", flashcardsOnKeyUp);

        /* return cleanup function to remove eventlisteners & cleanup object urls */
        return () => {
            window.removeEventListener("keydown", flashcardsOnKeyDown);
            window.removeEventListener("keyup", flashcardsOnKeyUp);
        };
    });
</script>

<div>
    <div class="keyed-flashcards-container card-size">
    {#key index}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- there's an accessible flip button as a seperate element, and you can also press space to flip (without any focus) -->
    <div
        class="card double {defSide && !prompt ? "flip" : ""}"
        onclick={flip}
        transition:fly={{
            x: direction * 100,
            duration: 200
        }}
    >
        <div class="content">
            <div
                class="front"
            >
                <div>
                    {#if showPrompt}
                        {@render prompt?.()}
                    {:else}
                        <div style="white-space:pre-wrap">{(termsList ? terms?.[index] : term)?.term ?? "term"}</div>
                        {#if (termsList ? terms?.[index] : term)?.termImageUrl != null}
                            <div><img src={(termsList ? terms[index] : term).termImageUrl} alt="term" class="flashcard-term-image"></div>
                        {/if}
                    {/if}
                </div>
            </div>
            <div
                class="back"
            >
                <div>
                    {#if !showPrompt}
                        <div style="white-space:pre-wrap">{(termsList ? terms?.[index] : term)?.def ?? "definition"}</div>
                        {#if (termsList ? terms?.[index] : term)?.defImageUrl != null}
                            <div><img src={(termsList ? terms[index] : term).defImageUrl} alt="definition" class="flashcard-term-image"></div>
                        {/if}
                    {/if}
                </div>
            </div>
        </div>
    </div>
    {/key}
    </div>
    <div class="caption">
        <div
            class="progress-bar thin yay"
            style="margin-left: 0.4rem; margin-right: 0.4rem;"
        >
            <div
                style="width: {terms != null
                    ? ((index + 1) / terms?.length) *
                      100
                    : '20'}%"
            ></div>
        </div>
    </div>
    <div class="caption centerThree">
        <p>{index + 1}<span class="fg0">/{terms?.length ?? "?"}</span></p>
        <div class="flex justifyselfcenter compact-gap">
            <button
                class="faint"
                aria-label="Previous Card"
                onclick={prev}
                disabled={showPrompt}
            >
                <IconArrowLeft />
            </button>
            <button
                class="faint"
                onclick={flip}
                disabled={showPrompt}>Flip</button
            >
            <button
                class="faint"
                aria-label="Next Card"
                onclick={next}
                disabled={showPrompt}
            >
                <IconArrowRight />
            </button>
        </div>
        <div class="flex end">
            <!--<button id="flashcards-maximize-button">
                <i class="nf nf-md-fullscreen"></i>
            </button>
            <button id="flashcards-unmaximize-button" class="hide">
                <i class="nf nf-md-fullscreen_exit"></i>
            </button>-->
        </div>
    </div>
</div>

<style>
    .flashcard-term-image {
        max-width: 300px;
        max-height: 200px;
        margin: 0px;
        padding: 0px;
        border-radius: 0.8rem;
    }
    .keyed-flashcards-container {
        position: relative;
        overflow: hidden;
    }
    .keyed-flashcards-container > .card {
        position: absolute;
        inset: 0;
        margin-top: 0px;
    }
</style>
