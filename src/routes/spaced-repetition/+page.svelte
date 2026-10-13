<script>
    import { SvelteMap, SvelteSet } from "svelte/reactivity";
    import { onMount } from "svelte";
    import { idbApiLayer } from "$lib/idb-api-layer";
    import { setCancelBeforeNavigate, cleanUpCancelBeforeNavigate } from "$lib/cancel-before-navigate.js";
    import { createEmptyCard, fsrs, Rating, State, TypeConvert, show_diff_message } from "ts-fsrs";
    import { goto } from "$app/navigation";
    import { slide, fade } from "svelte/transition";
    import Flashcards from "$lib/components/Flashcards.svelte";
    import BackIcon from "$lib/icons/BackArrow.svelte";
    import SRSIcon from "$lib/icons/FlaskScienceSRS.svelte";
    import CheckmarkIcon from "$lib/icons/Checkmark.svelte";
    import FlashcardsIcon from "$lib/icons/Flashcards.svelte";
    import GridIcon from "$lib/icons/AppsGrid.svelte";
    import ExitIcon from "$lib/icons/Exit.svelte";
    let { data } = $props();
    let terms = new SvelteMap();
    let termIds = {
        due: {
            learning: new SvelteSet(),
            relearning: new SvelteSet(),
            review: new SvelteSet(),
        },
        backlog: {
            learning: new SvelteSet(),
            relearning: new SvelteSet(),
            review: new SvelteSet(),
        },
        new: new SvelteSet(),
        future: {
            learning: new SvelteSet(),
            relearning: new SvelteSet(),
            review: new SvelteSet(),
        }
    };
    let showFlashcards = $state(false);
    let showMCQs = $state(false);
    let flashcards;
    data.studysets.forEach(s => {
        s.terms.forEach(t => {
            if (t?.id == null) {
                return;
            }
            if (t.fsrsCard != null) {
                t.fsrsCard = TypeConvert.card(t.fsrsCard);
            } else {
                t.fsrsCard = createEmptyCard();
            }
            terms.set(t.id, t);
            if (t.fsrsCard.state === State.New) {
                termIds.new.add(t.id);
            } else {
                let due = "future";
                if (t.fsrsCard.due != null) {
                    const diff = t.fsrsCard.due.getTime() - Date.now();
                    if (diff < 24*60*60*1_000) {
                        due = "backlog";
                    } else if (diff <= 0) {
                        due = "due";
                    }
                }
                switch (t.fsrsCard.state) {
                    case State.Learning:
                        termIds[due].learning.add(t.id);
                        break;
                    case State.Review:
                        termIds[due].review.add(t.id);
                        break;
                    case State.Relearning:
                        termIds[due].relearning.add(t.id);
                        break;
                }
            }
        });
    });

    var showExitConfirmationModal = $state(false);
    var bypassExitConfirmation = false;
    let navigatingToURL = $state("");
    function cancelBeforeNav(navigation) {
        /* NOTE: ALWAYS CLEAN UP WITH cleanUpCancelBeforeNavigate(cancelBeforeNav) IN ONMOUNT'S CLEANUP FUNC */
        if (
            (showFlashcards || showMCQs) &&
            !bypassExitConfirmation
        ) {
            navigatingToURL = navigation?.to?.url;
            if (navigation.type !== "leave") {
                /* when navigation.type is NOT "leave",
                it's controlled by SvelteKit, so we can
                show our js confirmation modal */
                showExitConfirmationModal = true;
            }

            /* if navigation.type is "leave",
            then its controlled by the browser &
            the browser shows it's own native modal
            when we use `.cancel()` */
            navigation.cancel();
            return true;
        } else {
            return false;
        }
    }
    setCancelBeforeNavigate(cancelBeforeNav);
    let objUrls = [];
    onMount(() => {
        if (data.localIds.length > 0) {
            (async () => {
                const localStudysets = await idbApiLayer.getStudysetsByIds(data.localIds, {
                    terms: {
                        progress: true,
                        termImageUrl: true,
                        defImageUrl: true
                    },
                });
            })();
        }
        return () => {
            cleanUpCancelBeforeNavigate(cancelBeforeNav);
            objUrls.forEach(objUrl => {
                URL.revokeObjectURL(objUrl);
            });
        };
    })
    function pickTerms() {
        
    }
</script>
<div class="grid page">
    <div class="content">
        <div>
            <a href={
                /* data.cloudIds.length+data.localIds.length is always > 0 because of +page.js */
                data.cloudIds.length + data.localIds.length > 1 ?
                    `/combine?${[
                        ...data.cloudIds.map((id) => `studyset=${id}`),
                        ...data.localIds.map((id) => `localStudyset=${id}`),
                    ].join("&")}` :
                    data.cloudIds.length == 1 ?
                        `/studysets/${data.cloudIds[0]}` :
                        `/studyset/local?id=${data.localIds[0]}`
            } class="button faint" style="justify-self: start;">
                <BackIcon />
                Back
            </a>
        </div>
        {#if showFlashcards}
            <Flashcards termsList={false} term={{term:"example term",def:"example def"}} viewerControls={false} showCaption={false} showBar={false} bind:this={flashcards} reqFlipFunc={() => console.log("flip plz")} reqNextFunc={() => console.log("next plz")} reqPrevFunc={() => console.log("prev plz")} />
            <div class="caption flex" style="justify-content: space-between;">
                <div>
                    {#if pickedTerm?.fsrsCard?.state == "LEARNING"}
                        <div class="qzfr-tag" style="--qzfr-tag-color: var(--warn);">Learning</div>
                    {:else if pickedTerm?.fsrsCard?.state == "REVIEW"}
                        <div class="qzfr-tag" style="--qzfr-tag-color: var(--yay);">Review</div>
                    {:else if pickedTerm?.fsrsCard?.state == "RELEARNING"}
                        <div class="qzfr-tag" style="--qzfr-tag-color: var(--ohno);">Relearning</div>
                    {:else}
                        <div class="qzfr-tag" style="--qzfr-tag-color: var(--main);">New</div>
                    {/if}
                </div>
                <div>
                <button class="alt" onclick={flashcards.triggerFlip}>
                    Show Answer
                </button>
                </div>
                <div></div>
            </div>
        {:else}
        <div class="flex" style="justify-content: center; flex-wrap: nowrap;">
            <div class="min-and-max-width-here">
                <div class="flex" style="align-items: center; margin-top: 2rem; margin-bottom: 1rem; flex-wrap: nowrap;">
                    <SRSIcon width="2rem" height="2rem" />
                    <span class="h3" style="margin-bottom: 0px;">Spaced Repetition</span>
                </div>
                <div class="flex" style="align-items: center;">
                    <span style="font-size: 1.4rem;">
                        {terms.size} total terms
                        {#if data.cloudIds.length+data.localIds.length > 1}
                            <span class="fg0">from {data.cloudIds.length+data.localIds.length} studysets</span>
                        {/if}
                    </span>
                </div>
                <div class="box">
                <div class="flex" style="align-items: center; justify-content: space-between; flex-wrap: nowrap;">
                    <div class="flex" style="align-items: center; gap: 0.6rem; font-size: 1.2rem; flex-wrap: nowrap;">
                        <FlashcardsIcon width="1em" height="1em" style="color: color-mix(in srgb, var(--fg-1) 60%, var(--fg-0));" />
                        <span>Flashcards</span>
                    </div>
                    <button onclick={() => showFlashcards = true}><CheckmarkIcon /> Start</button>
                </div>
                <div class="separator">or</div>
                <div class="flex" style="align-items: center; justify-content: space-between; flex-wrap: nowrap;">
                    <div class="flex" style="align-items: center; gap: 0.6rem; font-size: 1.2rem; flex-wrap: nowrap;">
                        <GridIcon width="1em" height="1em" />
                        <span>Multiple Choice Questions</span>
                    </div>
                    <button><CheckmarkIcon /> Start</button>
                </div>
                </div>
                <!-- <button class="large" style="width: 100%;"> -->
                <!--     <CheckmarkIcon /> -->
                <!--     Start -->
                <!-- </button> -->
                <div style="margin-top: 2rem;">
                    <div class="flex" style="flex-direction: column; flex-wrap: nowrap; align-items: start;">
                        <div class="grid srs-overview-grid">
                            <div class="flex srs-overview-state-head" style="grid-area: rl-head;">
                                <div class="qzfr-tag" style="--qzfr-tag-color: var(--ohno);">Relearning</div>
                                {const relearningTotal = $derived(termIds.backlog.relearning.size + termIds.due.relearning.size + termIds.future.relearning.size)}
                                <span class="fg0" style={relearningTotal > 0 ? "" : "opacity: 0.8;"} >{relearningTotal} {relearningTotal == 1 ? "term" : "terms"}</span>
                            </div>
                            <div class="box" style="grid-area: rl-backlog; {termIds.backlog.relearning.size > 0 ? '' : 'opacity: 0.8;'}">
                                <span style="font-size: 1.2rem;">{termIds.backlog.relearning.size}</span> {termIds.backlog.relearning.size == 1 ? "term" : "terms"}
                                <div class="text center fg0" style="font-size: 0.9rem; margin-top: 0.2rem;">Backlog</div>
                            </div>
                            <div class="box" style="grid-area: rl-due; {termIds.due.relearning.size > 0 ? '' : 'opacity: 0.8;'}">
                                <span style="font-size: 1.2rem;">{termIds.due.relearning.size}</span> {termIds.due.relearning.size == 1 ? "term" : "terms"}
                                <div class="text center fg0" style="font-size: 0.9rem; margin-top: 0.2rem;">Now</div>
                            </div>
                            <div class="box" style="grid-area: rl-future; {termIds.future.relearning.size > 0 ? '' : 'opacity: 0.8;'}">
                                <span style="font-size: 1.2rem;">{termIds.future.relearning.size}</span> {termIds.future.relearning.size == 1 ? "term" : "terms"}
                                <div class="text center fg0" style="font-size: 0.9rem; margin-top: 0.2rem;">Later</div>
                            </div>
                            <div class="flex srs-overview-state-head" style="grid-area: l-head;">
                                <div class="qzfr-tag" style="--qzfr-tag-color: var(--warn);">Learning</div>
                                {const learningTotal = $derived(termIds.backlog.learning.size + termIds.due.learning.size + termIds.future.learning.size)}
                                <span class="fg0" style={learningTotal > 0 ? "" : "opacity: 0.8;"} >{learningTotal} {learningTotal == 1 ? "term" : "terms"}</span>
                            </div>
                            <div class="box" style="grid-area: l-backlog; {termIds.backlog.learning.size > 0 ? '' : 'opacity: 0.8;'}">
                                <span style="font-size: 1.2rem;">{termIds.backlog.learning.size}</span> {termIds.backlog.learning.size == 1 ? "term" : "terms"}
                                <div class="text center fg0" style="font-size: 0.9rem; margin-top: 0.2rem;">Backlog</div>
                            </div>
                            <div class="box" style="grid-area: l-due; {termIds.due.learning.size > 0 ? '' : 'opacity: 0.8;'}">
                                <span style="font-size: 1.2rem;">{termIds.due.learning.size}</span> {termIds.due.learning.size == 1 ? "term" : "terms"}
                                <div class="text center fg0" style="font-size: 0.9rem; margin-top: 0.2rem;">Now</div>
                            </div>
                            <div class="box" style="grid-area: l-future; {termIds.future.learning.size > 0 ? '' : 'opacity: 0.8;'}">
                                <span style="font-size: 1.2rem;">{termIds.future.learning.size}</span> {termIds.future.learning.size == 1 ? "term" : "terms"}
                                <div class="text center fg0" style="font-size: 0.9rem; margin-top: 0.2rem;">Later</div>
                            </div>
                            <div class="flex srs-overview-state-head" style="grid-area: r-head;">
                                <div class="qzfr-tag" style="--qzfr-tag-color: var(--yay);">Review</div>
                                {const reviewTotal = $derived(termIds.backlog.review.size + termIds.due.review.size + termIds.future.review.size)}
                                <span class="fg0" style={reviewTotal > 0 ? "" : "opacity: 0.8;"} >{reviewTotal} {reviewTotal == 1 ? "term" : "terms"}</span>
                            </div>
                            <div class="box" style="grid-area: r-backlog; {termIds.backlog.review.size > 0 ? '' : 'opacity: 0.8;'}">
                                <span style="font-size: 1.2rem;">{termIds.backlog.review.size}</span> {termIds.backlog.review.size == 1 ? "term" : "terms"}
                                <div class="text center fg0" style="font-size: 0.9rem; margin-top: 0.2rem;">Backlog</div>
                            </div>
                            <div class="box" style="grid-area: r-due; {termIds.due.review.size > 0 ? '' : 'opacity: 0.8;'}">
                                <span style="font-size: 1.2rem;">{termIds.due.review.size}</span> {termIds.due.review.size == 1 ? "term" : "terms"}
                                <div class="text center fg0" style="font-size: 0.9rem; margin-top: 0.2rem;">Now</div>
                            </div>
                            <div class="box" style="grid-area: r-future; {termIds.future.review.size > 0 ? '' : 'opacity: 0.8;'}">
                                <span style="font-size: 1.2rem;">{termIds.future.review.size}</span> {termIds.future.review.size == 1 ? "term" : "terms"}
                                <div class="text center fg0" style="font-size: 0.9rem; margin-top: 0.2rem;">Later</div>
                            </div>
                            <div class="flex srs-overview-state-head" style="grid-area: n-head;">
                                <div class="qzfr-tag" style="--qzfr-tag-color: var(--main);">New</div>
                                <span class="fg0" style={termIds.new.size > 0 ? "" : "opacity: 0.8;"} >{termIds.new.size} {termIds.new.size == 1 ? "term" : "terms"}</span>
                            </div>
                            <div class="box" style="grid-area: new; {termIds.new.size > 0 ? '' : 'opacity: 0.8;'}">
                                <span style="font-size: 1.2rem;">{termIds.new.size}</span> {termIds.new.size == 1 ? "term" : "terms"}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        {/if}
    </div>
</div>
{#if showExitConfirmationModal}
    <div class="modal" transition:fade={{ duration: 200 }}>
        <div class="content">
            <h4>Are you sure you want to exit?</h4>
            <p>
                Your progress is not saved yet
            </p>
            <div class="flex">
                <button
                    class="alt"
                    onclick={function () {
                        showExitConfirmationModal = false;
                    }}>Continue Practice</button
                >
                <button
                    class="button ohno alt"
                    data-sveltekit-preload-data="false"
                    onclick={function () {
                        bypassExitConfirmation = true;
                        goto(navigatingToURL);
                    }}
                >
                    <ExitIcon />
                    Exit
                </button>
            </div>
        </div>
    </div>
{/if}
<style>
    .srs-overview-state-head {
        align-items: center;
        justify-content: space-between;
        flex-wrap: nowrap;
    }
    .srs-overview-grid,
    .grid.srs-overview-grid {
        grid-template-columns: 1fr 1fr 1fr;
        grid-template-rows: repeat(8, auto);
        column-gap: 1rem;
        row-gap: 0.8rem;
        grid-template-areas: "rl-head rl-head rl-head"
            "rl-backlog rl-due rl-future"
            "l-head l-head l-head"
            "l-backlog l-due l-future"
            "r-head r-head r-head"
            "r-backlog r-due r-future"
            "n-head n-head n-head"
            "new . ."
    }
    @media only screen and (min-width: 800px) {
        .min-and-max-width-here {
            width: 25rem;
        }
    }
</style>
