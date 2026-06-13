<script>
    import { onMount } from "svelte";
    import { fly } from "svelte/transition";
    import { prefersReducedMotion } from "svelte/motion";
    import IconArrowLeft from "$lib/icons/ArrowLeft.svelte";
    import IconArrowRight from "$lib/icons/ArrowRight.svelte";
    import IconBackArrow from "$lib/icons/BackArrow.svelte";

    let {
        termsList = true,
        terms,
        term,
        nextFunc, /* called when termsList false, return false to hide next trans */
        prevFunc, /* called when termsList false, return false to hide prev trans */
        onFlip, /* called when flipped (all the time, return nothing) */
        onNext, /* called when termsList true (return nothing) */
        onPrev, /* called when termsList true (return nothing) */
        showPrompt = false,
        prompt,
        captionEnd
    } = $props();

    let defSide = $state(false);
    let index = $state(0);
    let transKeyInc = $state(0);
    let transKey = $derived(index + transKeyInc);
    let direction = $state(1);

    function flip() {
        if (showPrompt) {
            return;
        }
        defSide = !defSide;

        if (onFlip) {
            onFlip();
        }
    }
    function prev() {
        if (showPrompt) {
            return;
        }
        if (termsList && index > 0) {
            direction = -1;
            index -= 1;
            defSide = false;
            if (onPrev) {
                onPrev();
            }
        }
        if (!termsList && prevFunc) {
            const transToPrev = prevFunc();
            if (transToPrev !== false) {
                direction = -1;
                transKeyInc++;
            }
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
            if (onNext) {
                onNext();
            }
        }
        if (!termsList && nextFunc) {
            const transToNext = nextFunc();
            if (transToNext !== false) {
                direction = 1;
                transKeyInc++;
            }
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
        <div class="keyed-flashcards-clip-wrapper">
            {#key transKey}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <!-- there's an accessible flip button as a seperate element, and you can also press space to flip (without any focus) -->
            <div
                class="card double {defSide && !showPrompt ? "flip" : ""}"
                onclick={flip}
                in:fly={{
                    x: prefersReducedMotion.current ?
                        0 : (direction * 100),
                    duration: 200
                }}
                out:fly={{
                    x: prefersReducedMotion.current ?
                        0 : (direction * -100),
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
            {@render captionEnd?.()}
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
    :global {
        .keyed-flashcards-container {
            position: relative;
        }
        .keyed-flashcards-clip-wrapper {
            position: absolute;
            inset: -2rem;
            overflow: clip;
            pointer-events: none; /* click-through because this overlaps other buttons/elements */
        }
        .keyed-flashcards-clip-wrapper > .card {
            pointer-events: auto; /* reset click-through from the wrapper so the card itself is still clickable */
            position: absolute;
            inset: 2rem;
            margin-top: 0px;
            width: auto;
            height: auto;
        }
        @media only screen and (max-width: 800px) {
            .keyed-flashcards-clip-wrapper {
                inset: -1rem;
            }
            .keyed-flashcards-clip-wrapper > .card {
                inset: 1rem;
            }
        }
    }
</style>
