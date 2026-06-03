<script>
    import { onMount, tick } from "svelte";
    import { goto, beforeNavigate } from "$app/navigation";
    import { idbApiLayer } from "$lib/idb-api-layer";
    import { cancelNprogressTimeout } from "$lib/stores/nprogressTimeout.js";
    import { slide, fade } from "svelte/transition";
    import { Confetti } from "svelte-confetti";
    import BackIcon from "$lib/icons/BackArrow.svelte";
    import ExitIcon from "$lib/icons/Exit.svelte";
    import CheckmarkIcon from "$lib/icons/Checkmark.svelte";
    import GridIcon from "$lib/icons/AppsGrid.svelte";

    let { local, cloudId, localId, data } = $props();
    let terms = data.terms;
    let items = $state([]);
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
        items = shuffleInPlace([
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

    let startTime;
    let inProgress = $state(false);
    let timerAnimationFrame;
    let lastRender;
    let timerTxtNode;
    let timerTxtNodeExtra;
    function updateTimer(now) {
        timerAnimationFrame = requestAnimationFrame(updateTimer);
        if (lastRender != null && now - lastRender < 10) {
            return;
        }
        lastRender = now;
        if (startTime == null) {
            return;
        }
        const ms = now - startTime;
        if (ms > 86400000) {
            timerTxtNode.data = "24h+ 😭"
            timerTxtNodeExtra.data = "";
            cancelAnimationFrame(updateTimer);
            return;
        }
        const totalSec = (ms / 1000) | 0;
        const min = (totalSec / 60) | 0;
        const sec = totalSec % 60;
        const subSec = ((ms % 1000) / 10) | 0;
        timerTxtNode.data = (min < 10 ? '0'+min : min)+':'+(sec < 10 ? '0'+sec : sec);
        timerTxtNodeExtra.data = '.'+(subSec < 10 ? '0'+subSec : subSec);
    }

    let objectUrls = [];
    let timerSpan;
    let timerSpanExtra;
    onMount(() => {
        if (local) {
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
        }

        return () => {
            cancelAnimationFrame(timerAnimationFrame);
            objectUrls.forEach(objectUrl => {
                URL.revokeObjectURL(objectUrl)
            });
        }
    })

    var showExitConfirmationModal = $state(false);
    var showTest = $state(data.alreadyOver);
    var bypassExitConfirmation = false;
    let navigatingToURL = $state("");
    beforeNavigate(function (navigation) {
        if (
            inProgress &&
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

    function anyPairsLeft() {
        const unanswered = items.filter(item => !item.answered);
        for (let index = 0; index < unanswered.length; index++) {
            const item = unanswered[index];
            const hasMatch = unanswered.some((item2, index2) => (
                index != index2 &&
                item.showDef ?
                    item.def.trim() == item2.def.trim() :
                    item.term.trim() == item2.term.trim() &&
                !(
                    item.showDef == item2.showDef &&
                    item.term.trim() != item.def.trim() &&
                    item2.term.trim() != item2.def.trim()
                )
            ));
            if (hasMatch) {
                return true;
            }
        }
        return false;
    }

    let timeElapsedMs;
    let showDone = $state(false);
    let showPerfect = $state(false);
    let correctCount = $state(0);
    let incorrectCount = $state(0);
    function matchDone() {
        if (showDone) {
            return;
        }
        showDone = true;
        timeElapsedMs = performance.now() - startTime;
        cancelAnimationFrame(timerAnimationFrame);
        inProgress = false;
        items.forEach(item => {
            if (item.answered && item.correct) {
                correctCount++;
            }
        });
        showPerfect = correctCount >= PAIRS_COUNT * 2;
        console.log(JSON.parse(JSON.stringify(items)));
    }

    let showSameSideWarning = $state(false);
    let showIncorrectAlert = $state(true);
    let tmpWarnItem1;
    let tmpWarnItem2;
    let tmpIncorrectItem1;
    let tmpIncorrectItem2;
    let selectedItem;
    let showStart = $state(true);

    function dismissSameSideWarn() {
        showSameSideWarning = false;
        if (tmpWarnItem1 != null) {
            tmpWarnItem1.tmpWarn = false
            tmpWarnItem1.selected = false
            tmpWarnItem1 = null;
        }
        if (tmpWarnItem2 != null) {
            tmpWarnItem2.tmpWarn = false
            tmpWarnItem2.selected = false
            tmpWarnItem2 = null;
        }
    }
    function dismissIncorrectAlert() {
        showIncorrectAlert = false;
        if (tmpWarnItem1 != null) {
            tmpWarnItem1.tmpWarn = false
            tmpWarnItem1.selected = false
            tmpWarnItem1 = null;
        }
        if (tmpWarnItem2 != null) {
            tmpWarnItem2.tmpWarn = false
            tmpWarnItem2.selected = false
            tmpWarnItem2 = null;
        }
    }
</script>
<div class="grid qzfr-match-head">
    <a href="{local ? `/studyset/local?id=${localId}` : `/studysets/${cloudId}`}" class="button faint" style="justify-self: start;">
        <BackIcon></BackIcon>
        Back
    </a>
    {#if !showStart && !showDone}
    <div style="justify-self: center;"><span class="qzfr-timer" bind:this={timerSpan}>00:00</span><span class="qzfr-timer fg0" bind:this={timerSpanExtra}>.00</span></div>
    <div></div>
    {/if}
</div>
{#if showStart}
<div class="flex" style="justify-content: center; margin-top: 4rem;">
    <div>
        <div class="flex" style="align-items: center; margin-bottom: 1rem;">
            <GridIcon width="2.2rem" height="2.2rem"></GridIcon>
            <h1 class="h3" style="margin-bottom: 0px;">Match</h1>
        </div>
        <p>
            <span class="line">Tap matching terms one after another to select a pair.</span>
            <span class="line">Tap a selected term again to clear selection.</span>
        </p>
        <button class="large" style="width: 100%; margin-top: 1.4rem;" onclick={async () => {
            showStart = false;
            await tick();
            startTime = performance.now();
            timerTxtNode = document.createTextNode("00:00");
            timerTxtNodeExtra = document.createTextNode(".00");
            timerSpan.replaceChildren(timerTxtNode);
            timerSpanExtra.replaceChildren(timerTxtNodeExtra);
            timerAnimationFrame = requestAnimationFrame(updateTimer);
        }}><CheckmarkIcon width="1em" height="1em"></CheckmarkIcon> Start</button>
    </div>
</div>
{:else if showDone}
<div class="flex" style="justify-content: center; margin-top: 4rem;">
    <div>
        <div class="flex" style="align-items: center; margin-bottom: 1rem;">
            <p class="h3" style="margin-bottom: 0px;">
                <span class={correctCount >= PAIRS_COUNT * 2 - 1 ? "yay" : correctCount <= PAIRS_COUNT ? "ohno" : ""}>{correctCount}</span>/{PAIRS_COUNT * 2} Correct in {
                    (timeElapsedMs > 60000 ? Math.floor(timeElapsedMs/60000)+"m " : "") + (timeElapsedMs/1000).toFixed(1)+"s"
                }
            </p>
        </div>
        <p>
            <span class="line">Tap matching terms one after another to select a pair.</span>
            <span class="line">Tap a selected term again to clear selection.</span>
        </p>
        <button class="large" style="width: 100%; margin-top: 1.4rem;" onclick={async () => {
            showStart = false;
            await tick();
            startTime = performance.now();
            timerTxtNode = document.createTextNode("00:00");
            timerTxtNodeExtra = document.createTextNode(".00");
            timerSpan.replaceChildren(timerTxtNode);
            timerSpanExtra.replaceChildren(timerTxtNodeExtra);
            timerAnimationFrame = requestAnimationFrame(updateTimer);
        }}><CheckmarkIcon width="1em" height="1em"></CheckmarkIcon> Start</button>
    </div>
</div>
{:else}
<div class="grid qzfr-match-grid">
    {#each items as item, index}
        <button class="button-box {
            item.selected || item.answeredCorrect ? "selected" : ""
        } {
            item.answeredCorrect ? "yay" : (item.incorrect ? "ohno" : (
                item.tmpWarn ? "warn" : ""
            ))
        }" disabled={item.answered} onclick={(ev) => {
            if (!inProgress) {
                inProgress = true;
            }

            
            if (item.selected) {
                item.selected = false;
                selectedItem = null;
                return;
            }
            item.selected = true;
            if (selectedItem != null) {
                if (item.showDef ?
                    selectedItem.def.trim() == item.def.trim() :
                    selectedItem.term.trim() == item.term.trim()
                ) {
                    if (
                        selectedItem.showDef == item.showDef &&
                        selectedItem.term.trim() != selectedItem.def.trim() &&
                        item.term.trim() != item.def.trim()
                    ) {
                        selectedItem.tmpWarn = true;
                        item.tmpWarn = true;
                        tmpWarnItem1 = selectedItem;
                        tmpWarnItem2 = item;
                        selectedItem = null;
                        showSameSideWarning = true;
                        return;
                    }
                    selectedItem.correct = true;
                    item.correct = true;
                    selectedItem.answered = true;
                    item.answered = true;
                } else {
                    selectedItem.incorrect = true;
                    item.incorrect = true;
                    tmpIncorrectItem1 = selectedItem;
                    tmpIncorrectItem2 = item;
                }
                selectedItem = null;
            } else {
                selectedItem = item;
            }

            if (!anyPairsLeft()) {
                matchDone();
            }
        }}>{item.showDef ? item.def : item.term}</button>
    {/each}
</div>
    {#if showSameSideWarning}
        <div class="grid qzfr-match-overlap-msg" style="justify-items: center; align-items: center;" transition:fade={{duration: 100}} onclick={dismissSameSideWarn}>
            <div class="content">
                <div class="box warn" style="padding: 1.4rem;">
                    <span style="font-size: 1.4rem;">
                        Same side selected twice!
                        <span class="line">Try Again</span>
                    </span>
                </div>
                <div class="flex" style="justify-content: center;">
                <button class="large faint" onclick={dismissSameSideWarn}>Tap anywhere to dismiss</button>
                </div>
            </div>
        </div>
    {:else if showIncorrectAlert}
        <div class="grid qzfr-match-overlap-msg" style="justify-items: center; align-items: center;" transition:fade={{duration: 100}} onclick={dismissIncorrectAlert}>
            <div class="content">
                <div class="box ohno" style="padding: 1.4rem;">
                    <span style="font-size: 1.4rem;">
                        Incorrect!
                        <span class="line">Try Again</span>
                    </span>
                </div>
                <div class="flex" style="justify-content: center;">
                <button class="large faint" onclick={dismissIncorrectAlert}>Tap anywhere to dismiss</button>
                </div>
            </div>
        </div>
    {/if}
{/if}
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
{#if showDone && showPerfect}
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
    .qzfr-timer {
        /* font-family: monospace; */
        font-size: 1.6rem;
    }
    .qzfr-match-head,
    .grid.qzfr-match-head {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        grid-template-rows: auto;
        padding: 0px 8rem;
        margin-top: 2rem;
        align-items: center;
    }
    .qzfr-match-overlap-msg {
        position: fixed;
        top: 0px;
        left: 0px;
        width: 100%;
        height: 100%;
        margin-top: 0px;
    }
    .qzfr-match-overlap-msg::before {
        content: "";
        position: fixed;
        z-index: 101;
        top: 0px;
        left: 0px;
        width: 100%;
        height: 100%;
        background-color: var(--bg-0);
        opacity: 0.4;
    }
    .qzfr-match-overlap-msg .content {
        z-index: 102;
    }
    .grid.qzfr-match-grid {
        grid-template-columns: 1fr 1fr 1fr 1fr;
        grid-template-rows: auto auto auto;
        gap: 1rem;
        padding: 0px 8rem;
        margin-top: 2rem;
        min-height: 80vh;
    }
    @media only screen and (max-width: 1000px) {
        .grid.qzfr-match-grid {
            grid-template-columns: 1fr 1fr 1fr;
            grid-template-rows: auto auto auto auto;
            padding: 0px 4rem;
        }
        .qzfr-match-head,
        .grid.qzfr-match-head {
            padding: 0px 4rem;
        }
    }
</style>
