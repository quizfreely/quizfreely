<script>
    import { onMount } from "svelte";
    import Flashcards from "$lib/components/Flashcards.svelte";
    import { idbApiLayer } from "$lib/idb-api-layer";
    import { createEmptyCard, fsrs, Rating } from "ts-fsrs";
    import BackArrow from "$lib/icons/BackArrow.svelte";
    import Checkmark from "$lib/icons/Checkmark.svelte";

    let { data, local, localId, cloudId } = $props();
    let terms = $state(data?.terms);
    let objectUrls = [];
    if (local) {
        onMount(() => {
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
                })
            })();

            // TODO: HERE (2)
            const scheduler = fsrs();
            const card = createEmptyCard();
            const preview = scheduler.repeat(card, new Date());
            console.log(preview[Rating.Again].card)
            console.log(preview[Rating.Hard].card)
            console.log(preview[Rating.Good].card)
            console.log(preview[Rating.Easy].card)
            console.log(scheduler.next(card, new Date(), Rating.Good, ({ card, log }) => ({
  card: {
    ...card,
  },
  log: {
    ...log,
  },
})))


            /* return cleanup func to revoke image object urls for local terms */
            return () => {
                objectUrls.forEach(objectUrl => URL.revokeObjectURL(objectUrl));
            };
        });
    }

    let testYourself = $state(true);
</script>
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
            <Flashcards {terms}></Flashcards>
        {/if}
        <div class="caption" style="min-height: 4rem;">
            <div>
                <div style="min-height: 6rem;">
                    {#if testYourself}
                        <div class="flex center">
                            <div class="flex col">
                                <button class="button-box">Again</button>
                                2 seconds
                            </div>
                            <div class="flex col">
                                <button class="button-box">Hard</button>
                                2 seconds
                            </div>
                            <div class="flex col">
                                <button class="button-box">Good</button>
                                2 seconds
                            </div>
                            <div class="flex col">
                                <button class="button-box">Easy</button>
                                2 seconds
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
