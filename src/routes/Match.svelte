<script>
    import { onMount } from "svelte";
    import { goto, beforeNavigate } from "$app/navigation";
    import { idbApiLayer } from "$lib/idb-api-layer";
    import { slide, fade } from "svelte/transition";
    import { Confetti } from "svelte-confetti";
    import BackIcon from "$lib/icons/BackArrow.svelte";

    let { local, cloudId, localId, data } = $props();
    let terms = data.terms;
    let selectedItems = $state([]);
    let showStartErr = $state(false);
    let startErrMsg = $state("");
    const PAIRS_COUNT = 6;
    const RANDOM_LOOP_MAX_TRIES = 40;

    if (!local && (terms == null || terms.length == 0)) {
        showStartErr = true;
        startErrMsg = "There aren't enough terms in this studyset!";
    } else if (!local) {
        selectTerms();
    }

    function selectTerms() {
        const indicies = [];
        for (let n = 0; n < PAIRS_COUNT; n++) {
            let randomIndex = Math.floor(Math.random() * terms.length);
            let tries = 0;
            while (indicies.includes(randomIndex)) {
                if (tries >= RANDOM_LOOP_MAX_TRIES) {
                    break;
                }
                randomIndex = Math.floor(Math.random() * terms.length);
                tries++;
            }
            indicies.push(randomIndex);
        }
        selectedItems = shuffleInPlace([
            ...indicies.map(index => ({
                ...terms[index],
                showDef: false
            })),
            ...indicies.map(index => ({
                ...terms[index],
                showDef: true
            }))
        ]);
    }
    function shuffleInPlace(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const i2 = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[i2]] = [arr[i2], arr[i]];
        }
        return arr;
    }

    let objectUrls = [];
    if (local) {
        onMount(() => {
            (async () => {
                const studyset = await idbApiLayer.getStudysetById(localId, {
                    terms: {
                        termImageUrl: true,
                        defImageUrl: true
                    }
                });
                if (studyset == null || studyset.terms == null) {
                    showStartErr = true;
                    startErrMsg = "Error loading studyset";
                    return;
                }
                if (studyset.terms.length == 0) {
                    showStartErr = true;
                    startErrMsg = "There are 0 terms in this studyset?";
                    return;
                }
                terms = studyset.terms;
                terms.forEach(term => {
                    objectUrls.push(term.termImageUrl);
                    objectUrls.push(term.defImageUrl);
                })
                selectTerms();
            })();
            return () => {
                objectUrls.forEach(objectUrl => {
                    URL.revokeObjectURL(objectUrl)
                });
            }
        })
    }

    var showExitConfirmationModal = $state(false);
    var showTest = $state(data.alreadyOver);
    var takingActualPracticeTest = $state(false);
    var bypassExitConfirmation = false;
    let navigatingToURL = $state("");
    beforeNavigate(function (navigation) {
        if (
            takingActualPracticeTest &&
            questionsAnswered > 0 &&
            !bypassExitConfirmation
        ) {
            navigatingToURL = navigation?.to?.url;
            if (navigation.type !== "leave") {
                /* when navigation.type is NOT "leave",
                it's controlled by SvelteKit, so we can
                show our js confirmation modal */
                showExitConfirmationModal = true;
            }
            /* our routes/+layout.svelte shows a progress bar
            if navigation takes too long, so we cancel the timer
            when we cancel navigation, so that it doesn't show */
            cancelNprogressTimeout();

            /* run it again a little delayed to make sure it cancels the timeout after layout actually finishes creating the timeout */
            setTimeout(cancelNprogressTimeout, 50);

            /* if navigation.type is "leave",
            then its controlled by the browser &
            the browser shows it's own native modal
            when we use `.cancel()` */
            navigation.cancel();
        }
    });
</script>
<div class="qzfr-match-head">
    <a href="{local ? `/studyset/local?id=${localId}` : `/studysets/${cloudId}`}" class="button faint">
        <BackIcon></BackIcon>
        Back
    </a>
</div>
<div class="grid qzfr-match-grid">
    {#each selectedItems as item}
        <button class="button-box">{item.showDef ? item.def : item.term}</button>
    {/each}
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
{#if false}
    <!-- fullscreen confetti if 100% accuracy -->
    <div
        style="position: fixed; top: -50px; left 0px; margin: 0px; padding: 0px; height: 100vh; width: 100vw; display: flex; justify-content: center; overflow: hidden; pointer-events: none;"
    >
        <Confetti
            x={[-5, 5]}
            y={[0, 0.1]}
            delay={[0, 6000]}
            duration={4000}
            amount="1000"
            fallDistance="200vh"
        />
    </div>
{/if}
<style>
    .qzfr-match-head {
        padding: 0px 4rem;
        padding-top: 2rem;
    }
    .grid.qzfr-match-grid {
        grid-template-columns: 1fr 1fr 1fr 1fr;
        grid-template-rows: 1fr 1fr 1fr;
        gap: 1rem;
        padding: 0px 4rem;
        margin-top: 2rem;
        height: 80vh;
    }
    @media only screen and (max-width: 1000px) {
        grid-template-columns: 1fr 1fr 1fr;
        grid-template-rows: 1fr 1fr 1fr 1fr;
    }
</style>
