<script>
    import { onMount } from "svelte";
    import IconArrowLeft from "$lib/icons/ArrowLeft.svelte";
    import IconArrowRight from "$lib/icons/ArrowRight.svelte";
    import IconBackArrow from "$lib/icons/BackArrow.svelte";

    let {
        terms,
        flashcardsMaximized,
        unmaximizeFlashcards,
        onNext,
        onPrev
    } = $props();

    let flashcardsIndex = $state(0);

    function flashcardsFlip() {
        document.getElementById("flashcard").classList.toggle("flip");
    }
    function flashcardsPrev() {
        if (onPrev) {
            onPrev();
        } else {
            if (flashcardsIndex > 0) {
                flashcardsIndex -= 1;
            }
        }
    }
    function flashcardsNext() {
        if (onNext) {
            onNext();
        } else {
            if (flashcardsIndex < terms?.length - 1) {
                flashcardsIndex += 1;
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
                    flashcardsPrev();
                    break;
                case "ArrowRight":
                case "l":
                case "k":
                    flashcardsNext();
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
                flashcardsFlip();
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

<div id="flashcards-outer-div">
    {#if flashcardsMaximized}
        <div class="flex">
            <button
                id="flashcards-unmaximize"
                class="faint"
                onclick={unmaximizeFlashcards}
            >
                <IconBackArrow /> Back
            </button>
        </div>
    {/if}
    <div>
        <div
            class="card double"
            id="flashcard"
            onclick={flashcardsFlip}
        >
            <div class="content">
                <div
                    class="front"
                    id="flashcard-front"
                >
                    <div>
                    <div style="white-space:pre-wrap">{terms?.[flashcardsIndex]?.term ?? "term"}</div>
                    {#if terms?.[flashcardsIndex]?.termImageUrl != null}
                    <div><img src={terms[flashcardsIndex].termImageUrl} alt="term image" class="flashcard-term-image"></div>
                    {/if}
                    </div>
                </div>
                <div
                    class="back"
                    id="flashcard-back"
                >
                    <div>
                    <div style="white-space:pre-wrap">{terms?.[flashcardsIndex]?.def ?? "definition"}</div>
                    {#if terms?.[flashcardsIndex]?.defImageUrl != null}
                    <div><img src={terms[flashcardsIndex].defImageUrl} alt="definition image" class="flashcard-term-image"></div>
                    {/if}
                    </div>
                </div>
            </div>
        </div>
        <div class="caption">
            <div
                class="progress-bar thin yay"
                style="margin-left: 0.4rem; margin-right: 0.4rem;"
            >
                <div
                    style="width: {terms != null
                        ? ((flashcardsIndex + 1) / terms?.length) *
                          100
                        : '20'}%"
                ></div>
            </div>
        </div>
        <div class="caption centerThree">
            <p id="flashcards-count">
                {flashcardsIndex + 1}/{terms?.length ?? "?"}
            </p>
            <div class="flex justifyselfcenter compact-gap">
                <button
                    id="flashcards-prev-button"
                    class="faint"
                    aria-label="Previous Card"
                    onclick={flashcardsPrev}
                >
                    <IconArrowLeft />
                </button>
                <button
                    id="flashcards-flip-button"
                    class="faint"
                    onclick={flashcardsFlip}>Flip</button
                >
                <button
                    id="flashcards-next-button"
                    class="faint"
                    aria-label="Next Card"
                    onclick={flashcardsNext}
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
</div>

<style>
    .flashcard-term-image {
        max-width: 300px;
        max-height: 200px;
        margin: 0px;
        padding: 0px;
        border-radius: 0.8rem;
    }
</style>
