<script>
    import { onMount } from "svelte";
    import Flashcards from "$lib/components/Flashcards.svelte";
    import { idbApiLayer } from "$lib/idb-api-layer";
    import { createEmptyCard, fsrs, Rating, State, TypeConvert, show_diff_message } from "ts-fsrs";
    import BackArrow from "$lib/icons/BackArrow.svelte";
    import Checkmark from "$lib/icons/Checkmark.svelte";

    let { data, local, localId, cloudId } = $props();
    let allTerms = $state(data?.terms ?? []);
    let term = $state(null);
    let terms = [];
    let termsIndex = -1;
    let newTerms = data?.terms ?? [];
    let newTermsIndex = -1;
    let sessionTerms = [];
    let sessionTermsIndex = -1;
    let sessionLogs = [];
    let objectUrls = [];

    let showPrompt = $state(false);

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

    function prepareTermsByCards() {
        terms = allTerms.filter(term => {
            if (local) {
                if (term.termImageUrl != null) {
                    objectUrls.push(term.termImageUrl);
                }
                if (term.defImageUrl != null) {
                    objectUrls.push(term.defImageUrl);
                }
            }

            let isNew = false;
            if (term.fsrsCard == null) {
                term.fsrsCard = createEmptyCard();
                isNew = true;
            } else {
                term.fsrsCard = TypeConvert.card(term.fsrsCard);
                if (term.fsrsCard.state == State.New) {
                    isNew = true;
                }
            }

            if (isNew) {
                newTerms.push(term);
            }
            return !isNew;
        });
        terms.sort((a, b) => a.fsrsCard.due - b.fsrsCard.due);
        if (terms.length > 0) {
            term = terms[0];
            termsIndex = 0;
        } else {
            term = newTerms[0];
            newTermsIndex = 0;
        }
    }

    const scheduler = fsrs();

    onMount(() => {
        if (local) {
            (async () => {
                allTerms = await idbApiLayer.getTermsByStudysetId(localId, {
                    termImageUrl: true,
                    defImageUrl: true
                });
                prepareTermsByCards();
            })();
        } else {
            prepareTermsByCards();
        }

        // const card = createEmptyCard();
        // console.log(card)
        // preview = scheduler.repeat(card, new Date());
        // console.log(preview[Rating.Again].card)
        // console.log(preview[Rating.Hard].card)
        // console.log(preview[Rating.Good].card)
        // console.log(preview[Rating.Easy].card)
        // console.log(
        //     scheduler.next(card, new Date(), Rating.Good, ({ card, log }) => ({
        //     }))
        // )

        /* return cleanup func to revoke image object urls for local terms */
        return () => {
            if (local) {
                objectUrls.forEach(objectUrl => URL.revokeObjectURL(objectUrl));
            }
        };
    });

    // let testYourself = $state(true);

    function prevFunc() {
        console.log(`sessionTermsIndex: ${sessionTermsIndex},
termsIndex: ${termsIndex},
newTermsIndex: ${newTermsIndex}`);
        if (sessionTermsIndex == -1 && sessionTerms.length > 0) {
            sessionTermsIndex = sessionTerms.length - 1;
            term = sessionTerms[sessionTermsIndex];
            return true;
        } else if (sessionTermsIndex > 0) {
            sessionTermsIndex--;
            term = sessionTerms[sessionTermsIndex];
            return true;
        } else {
            return false;
        }
    }

    function nextFunc() {
        console.log(`sessionTermsIndex: ${sessionTermsIndex},
termsIndex: ${termsIndex},
newTermsIndex: ${newTermsIndex}`);
        if (sessionTermsIndex >= 0 && sessionTermsIndex < sessionTerms.length - 1) {
            sessionTermsIndex++;
            term = sessionTerms[sessionTermsIndex];
            return true;
        } else if (sessionTermsIndex >= 0) {
            sessionTermsIndex = -1;
            if (termsIndex >= 0) {
                term = terms[termIndex];
            } else if (newTermsIndex >= 0) {
                term = newTerms[newTermsIndex]
            } else {
                // TODO: check if this is possible
                alert("both are negative, is that supposed to happen? please debug");
                term = newTerms[newTermsIndex]
            }
            return true;
        }

        sessionTerms.push(term);
        if (termsIndex >= 0 && termsIndex < terms.length - 1) {
            termsIndex++;
            term = terms[termsIndex];
        } else if (newTermsIndex < newTerms.length - 1) {
            newTermsIndex++;
            term = newTerms[newTermsIndex];
        } else {
            return false;
        }
        return true;
    }
</script>
{#snippet flashcardsPromptAddNew()}
    <p>Test Wow</p>
    <button>velda</button>
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
        {#if terms}
            <Flashcards
                termsList={true}
                {term}
                terms={allTerms}
                {showPrompt}
                prompt={flashcardsPromptAddNew}
                {prevFunc}
                {nextFunc}
            ></Flashcards>
        {/if}
        <!-- <div class="caption" style="min-height: 4rem;"> -->
        <!--     <div> -->
        <!--         <div style="min-height: 6rem;"> -->
        <!--             {#if testYourself} -->
        <!--                 <div class="flex center"> -->
        <!--                     <div class="flex col card-rating-button-container"> -->
        <!--                         <button class="button-box ohno">Again</button> -->
        <!--                         <span class="fg0">{preview == null ? "" : show_diff_message( -->
        <!--                             preview[Rating.Again].card.due, -->
        <!--                             preview[Rating.Again].card.last_review, -->
        <!--                             true, -->
        <!--                             TIMEUNITFORMAT -->
        <!--                         )}</span> -->
        <!--                     </div> -->
        <!--                     <div class="flex col card-rating-button-container"> -->
        <!--                         <button class="button-box">Hard</button> -->
        <!--                         <span class="fg0">{preview == null ? "" : show_diff_message( -->
        <!--                             preview[Rating.Hard].card.due, -->
        <!--                             preview[Rating.Hard].card.last_review, -->
        <!--                             true, -->
        <!--                             TIMEUNITFORMAT -->
        <!--                         )}</span> -->
        <!--                     </div> -->
        <!--                     <div class="flex col card-rating-button-container"> -->
        <!--                         <button class="button-box">Good</button> -->
        <!--                         <span class="fg0">{preview == null ? "" : show_diff_message( -->
        <!--                             preview[Rating.Good].card.due, -->
        <!--                             preview[Rating.Good].card.last_review, -->
        <!--                             true, -->
        <!--                             TIMEUNITFORMAT -->
        <!--                         )}</span> -->
        <!--                     </div> -->
        <!--                     <div class="flex col card-rating-button-container"> -->
        <!--                         <button class="button-box">Easy</button> -->
        <!--                         <span class="fg0">{preview == null ? "" : show_diff_message( -->
        <!--                             preview[Rating.Easy].card.due, -->
        <!--                             preview[Rating.Easy].card.last_review, -->
        <!--                             true, -->
        <!--                             TIMEUNITFORMAT -->
        <!--                         )}</span> -->
        <!--                     </div> -->
        <!--                 </div> -->
        <!--             {/if} -->
        <!--         </div> -->
        <!--         <div class="flex center" style="margin-top: 2rem;"> -->
        <!--             <button class="button-box flashcard-mode-button {testYourself ? "selected" : ""}" onclick={() => testYourself = true}> -->
        <!--                 <Checkmark class="button-box-selected-icon"></Checkmark> -->
        <!--                 <div> -->
        <!--                     <p class="top-text">Test Yourself</p> -->
        <!--                     <p class="btm-text">Flashcards with Spaced Repetition</p> -->
        <!--                 </div> -->
        <!--             </button> -->
        <!--             <button class="button-box flashcard-mode-button {testYourself ? "" : "selected"}" onclick={() => testYourself = false}> -->
        <!--                 <Checkmark class="button-box-selected-icon"></Checkmark> -->
        <!--                 <div> -->
        <!--                     <p class="top-text">View</p> -->
        <!--                     <p class="btm-text">Flip through flashcards</p> -->
        <!--                 </div> -->
        <!--             </button> -->
        <!--         </div> -->
        <!--     </div> -->
        <!-- </div> -->
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
    .card-rating-button-container {
        gap: 0.4rem;
    }
</style>
