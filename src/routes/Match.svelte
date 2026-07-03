<script>
    import { onMount, tick, onDestroy } from "svelte";
    import { goto } from "$app/navigation";
    import { setCancelBeforeNavigate } from "$lib/cancel-before-navigate.js";
    import { idbApiLayer, db } from "$lib/idb-api-layer";
    import { fancyTimestamp } from "$lib/fancyTimestamp";
    import { slide, fade } from "svelte/transition";
    import { Confetti } from "svelte-confetti";
    import BackIcon from "$lib/icons/BackArrow.svelte";
    import EyeIcon from "$lib/icons/Eye.svelte";
    import EyeSlashIcon from "$lib/icons/EyeSlash.svelte";
    import ExitIcon from "$lib/icons/Exit.svelte";
    import CheckmarkIcon from "$lib/icons/Checkmark.svelte";
    import GridIcon from "$lib/icons/AppsGrid.svelte";
    import RepeatIcon from "$lib/icons/Repeat.svelte";

    let { local, cloudId, localId, data } = $props();
    let terms = data.terms;
    let items = $state([]);
    let showStartErr = $state(false);
    let startErrMsg = $state("");
    const PAIRS_COUNT = 6;
    const RANDOM_LOOP_MAX_TRIES = 40;
    let termIds = [];
    let history = $state(data?.pastMatchActivities ?? []);
    let bestRecord = $state(null);
    let loadedTermsMap = new Map();

    if (!local && (terms == null || terms.length == 0)) {
        showStartErr = true;
        startErrMsg = "There aren't enough terms in this studyset!";
    } else if (!local) {
        selectTerms();
    }

    function selectTerms() {
        termIds = [];
        const indices = [];
        for (let n = 0; n < PAIRS_COUNT; n++) {
            let randomIndex = Math.floor(Math.random() * terms.length);
            let tries = 0;
            while (indices.includes(randomIndex)) {
                if (tries >= RANDOM_LOOP_MAX_TRIES) {
                    break;
                }
                randomIndex = Math.floor(Math.random() * terms.length);
                tries++;
            }
            indices.push(randomIndex);
        }
        indices.forEach((index) => {
            termIds.push(terms[index]?.id);
        })
        items = shuffleInPlace([
            ...indices.map(index => ({
                ...terms[index],
                showDef: false
            })),
            ...indices.map(index => ({
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
            cancelAnimationFrame(timerAnimationFrame);
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
    let timerSpan = $state(undefined);
    let timerSpanExtra = $state(undefined);
    let mounted = $state(false);
    onMount(() => {
        mounted = true;
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
        (async () => {
            try {
                history = [
                    ...history,
                    ...(await idbApiLayer.getMatchActivitiesByStudysetId(cloudId ?? Number(localId), {
                        termIds: true,
                        incorrectPairIds: true
                    }))
                ];
                history = history.sort(
                    (a, b) => b.endTimestamp.localeCompare(a.endTimestamp)
                );
            } catch (err) {
                console.error("error getting local match history:", err);
            }
            if (history?.length > 0) {
                let best = history[0];
                history.forEach((h) => {
                    const hIncorrect = h.incorrectPairIds.length;
                    const bestIncorrect = best.incorrectPairIds.length;
                    if (
                        hIncorrect < bestIncorrect ||
                        (hIncorrect === bestIncorrect && h.durationMs < best.durationMs)
                    ) {
                        best = h;
                    }
                });
                bestRecord = best;
            }
        })();

        return () => {
            cancelAnimationFrame(timerAnimationFrame);
            objectUrls.forEach(objectUrl => {
                URL.revokeObjectURL(objectUrl)
            });
            setCancelBeforeNavigate(undefined);
        }
    })

    var showExitConfirmationModal = $state(false);
    var showTest = $state(data.alreadyOver);
    var bypassExitConfirmation = false;
    let navigatingToURL = $state("");
    setCancelBeforeNavigate((navigation) => {
        /* NOTE: ALWAYS CLEAN UP WITH setCancelBeforeNavigate(undefined) IN ONMOUNT'S CLEANUP FUNC */
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

            /* if navigation.type is "leave",
            then its controlled by the browser &
            the browser shows it's own native modal
            when we use `.cancel()` */
            navigation.cancel();
            return true;
        } else {
            return false;
        }
    });

    let timeElapsedMs = $state(0);
    let showDone = $state(false);
    let showPerfect = $state(false);
    let incorrectPairs = $state([]);
    function matchDone() {
        if (showDone) {
            return;
        }
        showDone = true;
        timeElapsedMs = performance.now() - startTime;
        cancelAnimationFrame(timerAnimationFrame);
        inProgress = false;
        showPerfect = incorrectPairs.length <= 0;

        (async () => {
            if (local || !data.authed) {
                try {
                    const res = await idbApiLayer.recordMatchActivity({
                        durationMs: Math.floor(timeElapsedMs),
                        termIds,
                        incorrectPairIds: incorrectPairs
                    // NOTE: async func param below is supposed to return cloud studyset ids by cloud term ids
                    // in the future, we need to rewrite it to actually get the ids
                    // right now, there's only one studyset per matching activity, so we already have the id, and just return it
                    }, async (_) => { return cloudId == null ? [] : [cloudId]; });
                    if (res?.id == null) {
                        console.error("Err saving local match activity, res:", res);
                        alert("Error saving match progress");
                    }
                } catch (err) {
                    console.error("Error saving local match progress:", err);
                    alert("Error saving match progress");
                }
            } else {
                try {
                    const raw = await fetch("/api/graphql", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            query: `mutation recordMatch($durationMs: Int!, $termIds: [ID!]! $incorrectPairIds: [[ID!]!]!) {
    recordMatchActivity(input: {
        durationMs: $durationMs,
        termIds: $termIds,
        incorrectPairIds: $incorrectPairIds
    }) { id }
}`,
                            variables: {
                                durationMs: Math.floor(timeElapsedMs),
                                termIds,
                                incorrectPairIds: incorrectPairs
                            }
                        })
                    });
                    const resp = await raw.json();
                    if (resp?.data?.recordMatchActivity?.id == null) {
                        console.error("Err saving cloud match activity, resp:", resp);
                        alert("Error saving match progress");
                    }
                } catch (err) {
                    console.error("Error saving cloud match progress:", err);
                    alert("Error saving match progress");
                }
            }
        })();
    }

    let showSameSideWarning = $state(false);
    let showIncorrectAlert = $state(false);
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
        if (tmpIncorrectItem1 != null) {
            tmpIncorrectItem1.incorrect = false
            tmpIncorrectItem1.selected = false
            tmpIncorrectItem1 = null;
        }
        if (tmpIncorrectItem2 != null) {
            tmpIncorrectItem2.incorrect = false
            tmpIncorrectItem2.selected = false
            tmpIncorrectItem2 = null;
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
<div class="grid page" style="margin-top: 8rem;">
    <div class="content" style={bestRecord == null && (history?.length ?? 0) == 0 ? "opacity: 0.6;" : ""}>
        <p class="h4 fg0" style="margin-bottom: 0px;">
            Current Record
        </p>
        {#if bestRecord != null}
            <div class="box flex" style="gap: 2rem; margin-top: 0.6rem;">
                <span style="font-size: 1.4rem;">{((bestRecord?.durationMs ?? 0)/1000).toFixed(2)}s</span>
                <span style="font-size: 1.4rem;" class="{
                    bestRecord.incorrectPairIds?.length ?? 0 > 0 ? "ohno" : "yayy"
                }">{bestRecord.incorrectPairIds?.length ?? 0} incorrect</span>
            </div>
        {:else}
            <div class="box center text fg0">(None)</div>
        {/if}
        <div
            class="flex compact-gap"
            style="margin-top: 3rem; align-items: end; justify-content: space-between; flex-wrap: wrap;"
        >
            <p class="h4 fg0" style="margin-bottom: 0px;">
                Recent
            </p>
            <p class="fg0">{history?.length ?? 0} total</p>
        </div>
        {#each history as h}
            {const hDuration = $derived((h?.durationMs ?? 0) / 1000)}
            <div class="box outerfourpartthing">
                <div class="grid gridfourpartthingrow">
                    <span class="b fourpartthing-one">{hDuration?.toFixed?.(2)}s</span>
                    <span class="fourpartthing-two {
                        (h?.incorrectPairIds?.length ?? 0) > 0 ? "ohno" : "yayy"
                    }">{h?.incorrectPairIds?.length ?? 0} incorrect</span>
                    <span class="fourpartthing-three"
                        >{mounted
                            ? fancyTimestamp.format(
                                  h.endTimestamp,
                              )
                            : "..."}</span
                    >
                    <button class="fourpartthing-four faint pointer-events-none-if-disabled" disabled={h?.incorrectPairIds?.length == 0} style="padding: 0.5rem 0.8rem; {
                        h?.incorrectPairIds?.length == 0 ? "opacity: 0.6;" : ""
                    }" onclick={() => {
                        if (h.showDetails) {
                            h.showDetails = false;
                            return;
                        }
                        h.showDetails = true;
                        if (!h.termsLoaded) {
                            h.showDetailsLoading = true;
                            let cloudTermIds = [];
                            let localTermIds = [];
                            h.incorrectPairIds.forEach(pair => {
                                if (pair?.[0] != null && (""+pair[0]).includes("-") && !loadedTermsMap.has(pair[0])) {
                                    cloudTermIds.push(pair[0]);
                                }
                                if (pair?.[1] != null && (""+pair[1]).includes("-") && !loadedTermsMap.has(pair[1])) {
                                    cloudTermIds.push(pair[1]);
                                }
                            });
                            let cloudLoaded = false;
                            let localLoaded = false;
                            if (cloudTermIds.length > 0) {
                                (async () => {
                                    try {
                                        const raw = await fetch("/api/graphql", {
                                            method: "POST",
                                            headers: {
                                                "Content-Type": "application/json"
                                            },
                                            body: JSON.stringify({
                                                query: `query termsByIds($ids: [ID!]!) {
        terms(ids: $ids) {
            id
            term
            def
            termImageUrl
            defImageUrl
        }
    }`,
                                                variables: {
                                                    ids: cloudTermIds
                                                },
                                            }),
                                        });
                                        const resp = await raw.json();
                                        if (resp?.data?.terms == null) {
                                            console.error("resp?.data?.terms is null after loading cloud terms, resp:", resp);
                                        } else {
                                            resp.data.terms.forEach(term => {
                                                if (term?.id == null) {
                                                    return;
                                                }
                                                loadedTermsMap.set(term.id, term);
                                            });
                                        }
                                    } catch (err) {
                                        console.error("Error loading cloud terms", err);
                                    } finally {
                                        cloudLoaded = true;
                                        if (localLoaded) {
                                            h.showDetailsLoading = false;
                                            h.termsLoaded = true;
                                        }
                                    }
                                })();
                            } else {
                                cloudLoaded = true;
                            }
                            if (localTermIds.length > 0) {
                                (async () => {
                                    try {
                                        const terms = await idbApiLayer.getTermsByIds(localTermIds, {
                                            termImageUrl: true,
                                            defImageUrl: true
                                        });
                                        if (terms == null) {
                                            console.error("idbApiLayer.getTermsByIds returned null");
                                        } else {
                                            terms.forEach(term => {
                                                if (term?.id == null) {
                                                    return;
                                                }
                                                loadedTermsMap.set(term.id, term);
                                                if (term.termImageUrl != null) {
                                                    objectUrls.push(term.termImageUrl);
                                                }
                                                if (term.defImageUrl != null) {
                                                    objectUrls.push(term.defImageUrl);
                                                }
                                            })
                                        }
                                    } catch (err) {
                                        console.error("Error loading local terms", err);
                                    } finally {
                                        localLoaded = true;
                                        if (cloudLoaded) {
                                            h.showDetailsLoading = false;
                                            h.termsLoaded = true;
                                        }
                                    }
                                })();
                            } else {
                                localLoaded = true;
                                if (cloudLoaded) {
                                    h.showDetailsLoading = false;
                                    h.termsLoaded = true;
                                }
                            }
                        }
                    }}>
                        {#if h.showDetails}
                        <EyeSlashIcon></EyeSlashIcon> Hide Details
                        {:else}
                        <EyeIcon></EyeIcon> Show Details
                        {/if}
                    </button>
                </div>
                {#if h.showDetails}
                <div>
                    {#if h.showDetailsLoading}
                        <div class="flex" style="align-items: center; justify-content: center;">
                            <div class="spinner size-1.2rem"></div>
                            <span style="font-size: 1.2rem;">Loading</span>
                        </div>
                    {:else}
                        <p>Incorrect Pairs:</p>
                        <div class="grid" style="grid-template-columns: 1fr 1fr; row-gap: 2rem; column-gap: 2rem;">
                            {#each h.incorrectPairIds as pair}
                                <div class="no-margin-for-p-here">
                                    <p class="fg0" style="font-size: 0.8rem;">Term</p>
                                    <p style="white-space: pre-wrap;">{loadedTermsMap.get(pair[0])?.term}</p>
                                    {#if loadedTermsMap.get(pair[0])?.termImageUrl != null}
                                        <img class="term-image-small" src={loadedTermsMap.get(pair[0])?.termImageUrl}>
                                    {/if}
                                    <p class="fg0" style="font-size: 0.8rem; margin-top: 0.2rem;">Def</p>
                                    <p style="white-space: pre-wrap;">{loadedTermsMap.get(pair[0])?.def}</p>
                                    {#if loadedTermsMap.get(pair[0])?.defImageUrl != null}
                                        <img class="term-image-small" src={loadedTermsMap.get(pair[0])?.defImageUrl}>
                                    {/if}
                                </div>
                                <div class="no-margin-for-p-here">
                                    <p class="fg0" style="font-size: 0.8rem;">Term</p>
                                    <p style="white-space: pre-wrap;">{loadedTermsMap.get(pair[1])?.term}</p>
                                    {#if loadedTermsMap.get(pair[1])?.termImageUrl != null}
                                        <img class="term-image-small" src={loadedTermsMap.get(pair[1])?.termImageUrl}>
                                    {/if}
                                    <p class="fg0" style="font-size: 0.8rem; margin-top: 0.2rem;">Def</p>
                                    <p style="white-space: pre-wrap;">{loadedTermsMap.get(pair[1])?.def}</p>
                                    {#if loadedTermsMap.get(pair[1])?.defImageUrl != null}
                                        <img class="term-image-small" src={loadedTermsMap.get(pair[1])?.defImageUrl}>
                                    {/if}
                                </div>
                            {/each}
                        </div>
                    {/if}
                </div>
                {/if}
            </div>
        {:else}
            <div class="box center text fg0">(None)</div>
        {/each}
    </div>
</div>
{:else if showDone}
<div class="flex" style="justify-content: center; margin-top: 4rem;">
    <div>
        <div class="flex" style="align-items: center; margin-bottom: 1rem;">
            <p class="h3" style="margin-bottom: 0px;">
                {
                    (timeElapsedMs > 60000 ? Math.floor(timeElapsedMs/60000)+"m " : "") + (timeElapsedMs/1000).toFixed(2)+"s"
                } with <span class={incorrectPairs.length > 1 ? "ohno" : (incorrectPairs.length > 0 ? "warn" : "yay")}>
                    {incorrectPairs.length} incorrect
                </span>
            </p>
        </div>
        <p>
            {
                ((timeElapsedMs / PAIRS_COUNT) > 60000 ? Math.floor((timeElapsedMs/PAIRS_COUNT)/60000)+"m " : "") + ((timeElapsedMs/PAIRS_COUNT)/1000).toFixed(2)+"s"
            } average time per pair
        </p>
        <!-- <a href={local ? `/studyset/local?id=${localId}` : `/studysets/${cloudId}`} class="button large" style="width: 100%; margin-top: 1.4rem;"> -->
        <button class="large" style="width: 100%; margin-top: 1.4rem;" onclick={() => {
            window.location.reload()
        }}>
            <CheckmarkIcon width="1em" height="1em"></CheckmarkIcon> Done
        </button>
        <button class="large alt" style="width: 100%; margin-top: 1.4rem;" onclick={() => {
            window.location.reload()
        }}><RepeatIcon width="1em" height="1em"></RepeatIcon> Play Again</button>
    </div>
</div>
{:else}
<div class="grid qzfr-match-grid">
    {#each items as item, index}
        <button class="button-box {
            item.selected || item.correct || item.incorrect || item.tmpWarn ? "selected" : ""
        } {
            item.correct ? "yay qzfr-fade-trans" : (
                item.incorrect ? "ohno" : (
                    item.tmpWarn ? "warn" : ""
                )
            )
        }" disabled={item.correct} onclick={(ev) => {
            if (!inProgress) {
                inProgress = true;
            }
            
            if (item.selected) {
                item.selected = false;
                selectedItem = null;
                return;
            }
            item.selected = true;
            if (selectedItem == null) {
                selectedItem = item;
            } else {
                const itmTxtTrmd = (item.showDef ?
                    item.def : item.term
                ).trim();
                const slctdTxtTrmd = (selectedItem.showDef ?
                    selectedItem.def : selectedItem.term
                ).trim();
                if (
                    itmTxtTrmd == slctdTxtTrmd &&
                    item.term.trim() != item.def.trim() &&
                    selectedItem.term.trim() != selectedItem.def.trim()
                ) {
                    selectedItem.tmpWarn = true;
                    item.tmpWarn = true;
                    tmpWarnItem1 = selectedItem;
                    tmpWarnItem2 = item;
                    selectedItem = null;
                    showSameSideWarning = true;
                } else if (
                    (item.showDef &&
                    item.term.trim() == slctdTxtTrmd) ||
                    item.def.trim() == slctdTxtTrmd ||
                    (selectedItem.showDef &&
                    selectedItem.term.trim() == itmTxtTrmd) ||
                    selectedItem.def.trim() == itmTxtTrmd
                ) {
                    selectedItem.correct = true;
                    item.correct = true;
                } else {
                    selectedItem.incorrect = true;
                    item.incorrect = true;
                    tmpIncorrectItem1 = selectedItem;
                    tmpIncorrectItem2 = item;
                    showIncorrectAlert = true;
                    incorrectPairs.push([
                        tmpIncorrectItem1?.id,
                        tmpIncorrectItem2?.id
                    ]);
                }
                selectedItem = null;
            }

            let allCorrect = true;
            for (let index = 0; index < items.length; index++) {
                if (!items[index].correct) {
                    allCorrect = false;
                    break;
                }
            }
            if (allCorrect) {
                matchDone();
            }
        }}>
            <p style="white-space: pre-wrap;">{item.showDef ? item.def : item.term}</p>
            {#if (item.showDef ? item.defImageUrl : item.termImageUrl) != null}
                <img
                    src={item.showDef ? item.defImageUrl : item.termImageUrl}
                    class="qzfr-item-img"
                />
            {/if}
        </button>
    {/each}
</div>
    {#if showSameSideWarning}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
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
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div class="grid qzfr-match-overlap-msg" style="justify-items: center; align-items: center;" transition:fade={{duration: 100}} onclick={dismissIncorrectAlert}>
            <div class="content">
                <div class="box center ohno" style="padding: 1.4rem;">
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
        opacity: 0.8;
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
    .qzfr-item-img {
        border-radius: 0.8rem;
        max-height: 20vh;
        max-width: 18vw;
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
        .qzfr-item-img {
            max-height: 12vh;
            max-width: 22vw;
        }
    }
    @media only screen and (max-width: 800px) {
        .grid.qzfr-match-grid {
            padding: 0px 2rem;
        }
        .qzfr-match-head,
        .grid.qzfr-match-head {
            padding: 0px 2rem;
        }
    }
    @keyframes qzfrFadeTransAnim {
        0% {
            opacity: 1;
            visibility: visible;
        }
        100% {
            opacity: 0;
            visibility: hidden;
        }
    }
    .qzfr-fade-trans {
        animation: qzfrFadeTransAnim 1s ease-in-out forwards;
    }

    .gridfourpartthingrow {
        display: grid;
        gap: 1rem;
        grid-template-columns: 1fr 2fr 3fr auto;
        grid-template-rows: auto;
        grid-template-areas: "one two three four";
    }
    .outerfourpartthing,
    .box.outerfourpartthing {
        padding: 0.6rem 1rem;
    }
    .fourpartthing-one {
        grid-area: one;
        align-self: center;
    }
    .fourpartthing-two {
        grid-area: two;
        align-self: center;
    }
    .fourpartthing-three {
        grid-area: three;
        align-self: center;
        justify-self: start;
    }
    .fourpartthing-four {
        grid-area: four;
        align-self: center;
        justify-self: end;
    }
    @media only screen and (max-width: 800px) {
        .gridfourpartthingrow {
            grid-template-columns: 1fr 2fr 3fr;
            grid-template-rows: auto auto;
            grid-template-areas:
                "one two three"
                "four four four";
        }
        .outerfourpartthing,
        .box.outerfourpartthing {
            padding: 1rem;
        }
        .fourpartthing-three {
            justify-self: end;
        }
        .fourpartthing-four {
            justify-self: center;
        }
    }
    .pointer-events-none-if-disabled:disabled {
        pointer-events: none;
    }
    .no-margin-for-p-here p {
        margin-bottom: 0px;
        margin-top: 0px;
    }
    .term-image-small {
        max-width: 300px;
        max-height: 200px;
        border-radius: 0.8rem;
    }
</style>
