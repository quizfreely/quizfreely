<script>
    import { onMount } from "svelte";
    import Flashcards from "$lib/components/Flashcards.svelte";
    import { idbApiLayer } from "$lib/idb-api-layer";
    import { createEmptyCard, fsrs, Rating, TypeConvert, show_diff_message } from "ts-fsrs";
    import BackArrow from "$lib/icons/BackArrow.svelte";
    import Checkmark from "$lib/icons/Checkmark.svelte";

    let { data, local, localId, cloudId } = $props();
    let terms = $state(data?.terms ?? []);
    let objectUrls = [];

    let showPrompt = false;

    let preview = $state(null);
    const TIMEUNITFORMAT = ['s', 'm', 'h', 'd', ' months', ' years'];
    const fsrsStates = ["NEW", "LEARNING", "REVIEW", "RELEARNING"];
    const fsrsRatings = ["MANUAL", "HARD", "GOOD", "EASY"];
    function fsrsNextAfterHandler({card, log}) {
        return {
            card: {
                ...card,
                due: card.due.toISOString(),
                last_review: card?.last_review?.toISOString() ?? null,
                state: fsrsCards[card.state]
            },
            log: {
                ...log,
                due: log.due.toISOString(),
                rating: fsrsRatings[log.rating],
                review: log.review.toISOString(),
                state: fsrsStates[log.state]
            }
        };
    }

    function sortTermsByCards() {
        terms.sort((a, b) => a.due - b.due);
    }

    onMount(() => {
        if (local) {
            (async () => {
                terms = await idbApiLayer.getTermsByStudysetId(localId, {
                    termImageUrl: true,
                    defImageUrl: true
                });
                terms.forEach(term => {
                    if (term.termImageUrl != null) {
                        objectUrls.push(term.termImageUrl);
                    }
                    if (term.defImageUrl != null) {
                        objectUrls.push(term.defImageUrl);
                    }
                    if (term.card == null) {
                        term.card = createEmptyCard();
                    } else {
                        term.card = TypeConvert.card(term.card);
                    }
                })
                sortTermsByCards();
            })();
        }

        // TODO: HERE
        const scheduler = fsrs();
        const card = createEmptyCard();
        console.log(card)
        preview = scheduler.repeat(card, new Date());
        console.log(preview[Rating.Again].card)
        console.log(preview[Rating.Hard].card)
        console.log(preview[Rating.Good].card)
        console.log(preview[Rating.Easy].card)
        console.log(
            scheduler.next(card, new Date(), Rating.Good, ({ card, log }) => ({
            }))
        )
        console.log(TypeConvert.card({
            "due": "2026-05-17T01:21:15.050Z",
            "stability": 8.2956,
            "difficulty": 1,
            "elapsed_days": 0,
            "scheduled_days": 8,
            "reps": 1,
            "lapses": 0,
            "learning_steps": 0,
            "state": 2,
            "last_review": "2026-05-09T01:21:15.050Z"
        }))

        /* return cleanup func to revoke image object urls for local terms */
        return () => {
            if (local) {
                objectUrls.forEach(objectUrl => URL.revokeObjectURL(objectUrl));
            }
        };
    });

    let testYourself = $state(true);
</script>
{#snippet flashcardsPromptAddNew()}
    <p>Test Wow</p>
    <button>ojala</button>
{/snippet}
<div class="grid page">
    <div class="content">
        <div class="flex">
            {#if local}
                <a href="/studyset/local?id={localId}" class="button faint"><BackArrow /> Back</a>
            {:else}
                <a href="/studysets/{cloudId}" class="button faint"><BackArrow /> Back</a>
            {/if}
        </div>
        {#if terms?.length > 0}
            <Flashcards {terms} showPrompt={true} prompt={flashcardsPromptAddNew}></Flashcards>
        {/if}
        <div class="caption" style="min-height: 4rem;">
            <div>
                <div style="min-height: 6rem;">
                    {#if testYourself}
                        <div class="flex center">
                            <div class="flex col">
                                <button class="button-box ohno">Again</button>
                                <span class="fg0">{preview == null ? "" : show_diff_message(
                                    preview[Rating.Again].card.due,
                                    preview[Rating.Again].card.last_review,
                                    true,
                                    TIMEUNITFORMAT
                                )}</span>
                            </div>
                            <div class="flex col">
                                <button class="button-box">Hard</button>
                                <span class="fg0">{preview == null ? "" : show_diff_message(
                                    preview[Rating.Hard].card.due,
                                    preview[Rating.Hard].card.last_review,
                                    true,
                                    TIMEUNITFORMAT
                                )}</span>
                            </div>
                            <div class="flex col">
                                <button class="button-box">Good</button>
                                <span class="fg0">{preview == null ? "" : show_diff_message(
                                    preview[Rating.Good].card.due,
                                    preview[Rating.Good].card.last_review,
                                    true,
                                    TIMEUNITFORMAT
                                )}</span>
                            </div>
                            <div class="flex col">
                                <button class="button-box">Easy</button>
                                <span class="fg0">{preview == null ? "" : show_diff_message(
                                    preview[Rating.Easy].card.due,
                                    preview[Rating.Easy].card.last_review,
                                    true,
                                    TIMEUNITFORMAT
                                )}</span>
                            </div>
                        </div>
                    {/if}
                </div>
                <div class="flex center" style="margin-top: 2rem;">
                    <button class="button-box flashcard-mode-button {testYourself ? "selected" : ""}" onclick={() => testYourself = true}>
                        <Checkmark class="button-box-selected-icon"></Checkmark>
                        <div>
                            <p class="top-text">Test Yourself</p>
                            <p class="btm-text">Flashcards with Spaced Repetition</p>
                        </div>
                    </button>
                    <button class="button-box flashcard-mode-button {testYourself ? "" : "selected"}" onclick={() => testYourself = false}>
                        <Checkmark class="button-box-selected-icon"></Checkmark>
                        <div>
                            <p class="top-text">View</p>
                            <p class="btm-text">Flip through flashcards</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .flashcard-mode-button,
    .button-box.flashcard-mode-button {
        display: flex;
        flex-direction: row;
        text-align: start;
    }
    .flashcard-mode-button div,
    .button-box.flashcard-mode-button div {
        margin-top: 0px;
    }
    .flashcard-mode-button .top-text {
        font-size: 1.2rem;
    }
    .flashcard-mode-button .btm-text {
        margin-top: 0px;
        font-size: 0.9rem;
    }
</style>
