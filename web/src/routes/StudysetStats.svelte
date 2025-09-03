<script>
    import { onMount } from "svelte";
    import Chart from 'chart.js/auto';
    import 'chartjs-adapter-luxon';
    import { setEhuiChartColors } from "$lib/ehui-chartjs-colors.js";
    import { fancyTimestamp } from "$lib/fancyTimestamp";
    import BackIcon from "$lib/icons/BackArrow.svelte"
    import ForwardLongArrowIcon from "$lib/icons/ForwardRightArrowLong.svelte"
    import StatsIcon from "$lib/icons/ChartGraphLine.svelte"
    import { slide } from "svelte/transition";
    let { data } = $props();
    let terms = $state();
    let practiceTests = $state([]);

    if (!data.local) {
        console.log(data.studyset)
        terms = data?.studyset?.terms;
        practiceTests = data?.studyset?.practiceTests;
    }

    let chartCanvasTerms;
    let chartCanvas;

    let mounted = $state(false);
    onMount(() => {
        mounted = true;
        if (data?.settingsDateTimeFmtHours == "24") {
            fancyTimestamp.hours = 24;
        } else if (data?.settingsDateTimeFmtHours == "12") {
            fancyTimestamp.hours = 12;
        }

        if (data.local) {
            /* studyset is local, so regardless of wheater the user is logged in or not,
            we load the studyset and progress locally */
            (async () => {
                const studyset = await idbApiLayer.getStudysetById(data.localId, {
                    terms: {
                        progress: true,
                        topConfusionPairs: {
                            confusedTerm: true
                        },
                        topReverseConfusionPairs: {
                            term: true
                        }
                    },
                    practiceTests: true
                })
                terms = studyset.terms;
                practiceTests = studyset?.practiceTests;
            })();
        }

        if (!data.authed && !data.local) {
            /* not logged in, so user data is local,
            but studyset is a cloud studyset,
            so we need to map local progress to cloud terms

            `terms` has already been populated during SSR (above, before onMount) */
            (async () => {
                practiceTests = await db.practiceTests.where("studysetId").equals(data.studysetId).toArray();
                practiceTests?.sort(
                    /* timestamps are ISO strings in UTC,
                    so lexical/alphanumeric sorting is the same as chronological sorting
                    also you see we're comparing `b` to `a`, so its descending,
                    so most recent is first */
                    (a, b) => b.timestamp.localeCompare(a.timestamp)
                );
                practiceTests = practiceTests;

                for (const term of terms) {
                    term.progress = await db.termProgress.where("termId").equals(term.id).toArray()?.[0];
                    term.topConfusionPairs = await idbApiLayer.getTopConfusionPairs(term.id)
                    term.topReverseConfusionPairs = await idbApiLayer.getTopReverseConfusionPairs(term.id)
                }
            })();
        }

        Chart.defaults.font.size = 16;
        const rootStyles = getComputedStyle(document.documentElement);
        const mainColor = rootStyles.getPropertyValue("--main").trim();
        const fg1Color = rootStyles.getPropertyValue("--fg-1").trim();
        const bg2Color = rootStyles.getPropertyValue("--bg-2").trim();
        const borderColor = rootStyles.getPropertyValue("--border").trim();
        const yayColor = rootStyles.getPropertyValue("--yay").trim();
        const ohnoColor = rootStyles.getPropertyValue("--ohno").trim();
        const bg3Color = rootStyles.getPropertyValue("--bg-3").trim();
        Chart.defaults.backgroundColor = mainColor;
        Chart.defaults.borderColor = borderColor;
        Chart.defaults.color = fg1Color;
        if (practiceTests?.length > 1) {
            new Chart(
                chartCanvas,
                {
                    type: "line",
                    data: {
                        datasets: [
                            ...(practiceTests?.length > 1 ? [{
                                label: "Practice Test Scores",
                                fill: false,
                                tension: 0,
                                borderColor: mainColor,
                                backgroundColor: mainColor,
                                pointStyle: "circle",
                                pointRadius: 6,
                                pointHoverRadius: 8,
                                data: practiceTests.map(pt => ({
                                    x: Date.parse(pt.timestamp),
                                    y: pt.questionsCorrect / pt.questionsTotal
                                }))
                            }] : [])
                        ]
                    },
                    options: {
                        scales: {
                            x: {
                                type: "timeseries",
                                suggestedMax: Date.now(),
                                time: {
                                    unit: "day",
                                    tooltipFormat: data?.settingsDateTimeFmtHours != null ?
                                        (data?.settingsDateTimeFmtHours == "24" ?
                                            "dd MMM yyyy, HH:mm" :
                                            "dd MMM yyyy, h:mm a"
                                        ) :
                                        undefined
                                }
                            },
                            y: {
                                ticks: {
                                    stepSize: 0.2,
                                    format: {
                                        style: "percent",
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 0
                                    }
                                }
                            }
                        },
                        interaction: {
                            intersect: false,
                            mode: "nearest",
                            axis: "xy"
                        },
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            title: {
                                display: true,
                                text: "Practice Test Scores",
                                font: { weight: "normal" }
                            },
                            tooltip: {
                                backgroundColor: bg2Color,
                                titleColor: fg1Color,
                                bodyColor: fg1Color,
                                footerColor: fg1Color,
                                titleFont: { weight: "normal" },
                                displayColors: false,
                                callbacks: {
                                    label: ctx => Math.floor(ctx.raw.y * 100) + "%"
                                }
                            },
                            legend: {
                                display: false
                                // labels: {
                                //     usePointStyle: true
                                // }
                            }
                        }
                    }
                }
            );
        }
    })

    let showAllTerms = $state(false);
    const COLLAPSED_TERMS_COUNT = 4;
    let showAllPracticeTests = $state(false);
    const COLLAPSED_PRACTICE_TESTS_COUNT = 4;


    /* returns average term accuracy from term & def correct/incorrect counts.

    averages defined values and leaves out undefined values,
    but it will return NaN if both term & def counts are null,
    so call it if at least one of them is defined
    (only call it if term.progress is populated)
    for example, somewhere below we have this condition before calling averageAccuracy
    ```svelte
    {#if term.progress && (
        term.progress.termCorrectCount > 0 ||
        term.progress.termIncorrectCount > 0 ||
        term.progress.defCorrectCount > 0 ||
        term.progress.defIncorrectCount > 0
    )}
        <!-- ... -->
        {averageAccuracy(
            term.progress.termCorrectCount,
            term.progress.termIncorrectCount,
            term.progress.defCorrectCount,
            term.progress.defIncorrectCount
        )}%
        <!-- ... -->
    {/if}
    */
    function averageAccuracy(tc, ti, dc, di) {
        /* tc = termCorrect, ti = termIncorrect,
        dc = defCorrect, di = defIncorrect */
        let avg;
        if (tc + ti > 0) {
            avg = tc / (tc+ti);
        }
        if (dc + di > 0) {
            avg = (avg + (
                dc / (dc+di)
            )) / 2
        }
        return Math.floor(avg * 100);
    }

    let termsHeader;
    let practiceTestsHeader;
</script>
<style>
    .gridfourpartthingrow {
        display: grid;
        gap: 1rem;
        grid-template-columns: 1fr 1fr 2fr auto;
        grid-template-rows: 1fr;
        grid-template-areas: "one two three four";
    }
    .fourpartthing-one {
        grid-area: one;
    }
    .fourpartthing-two {
        grid-area: two;
    }
    .fourpartthing-three {
        grid-area: three;
        justify-self: start;
    }
    .fourpartthing-four {
        grid-area: four;
        justify-self: end;
    }
    @media only screen and (max-width: 800px) {
        .gridfourpartthingrow {
            grid-template-columns: 1fr 1fr 2fr;
            grid-template-rows: auto auto;
            grid-template-areas:
                "one two three"
                "four four four"
        }
        .fourpartthing-three {
            justify-self: end;
        }
        .fourpartthing-four {
            justify-self: start;
        }
    }
    .chart-container {
        position: relative;
        width: 100%;
        max-width: 100%;
        height: 16rem;
    }
    
    .chart-container canvas {
        width: 100% !important;
        height: 100% !important;
    }

    .grid-split-but-different {
        display: grid;
        gap: 1rem;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: auto auto;
        grid-template-areas:
            "terms-chart practice-tests-chart"
            "terms practice-tests"
    }
    .grid-split-but-different .terms-chart-area {
        grid-area: terms-chart;
    }
    .grid-split-but-different .terms-area {
        grid-area: terms;
    }
    .grid-split-but-different .practice-tests-chart-area {
        grid-area: practice-tests-chart;
    }
    .grid-split-but-different .practice-tests-area {
        grid-area: practice-tests;
    }
    @media only screen and (max-width: 1000px) {
        .grid-split-but-different {
            gap: 2rem;
            grid-template-columns: auto;
            grid-template-rows: auto auto auto auto;
            grid-template-areas:
                "terms-chart"
                "terms"
                "practice-tests-chart"
                "practice-tests"
        }
    }

    .shy-h4 {
        font-size: 1.2rem;
    }
</style>
<div class="grid page">
    <div class="content">
        <div class="flex">
            <a class="button faint" href={data.local ?
                `/studyset/local?id=${data.localId}` :
                `/studysets/${data.studysetId}`
            }>
                <BackIcon></BackIcon>
                Back
            </a>
        </div>
<div class="grid grid-split-but-different">
            <div class="terms-chart-area">
                <!-- put chart/graph here later -->
            </div>
            <div class="terms-area">
                <p class="h4" bind:this={termsHeader}>Terms</p>
                {#each terms as term, index}
                    {#if index < COLLAPSED_TERMS_COUNT || showAllTerms}
                    <div class="box" transition:slide={{duration: 600}}>
                        <div class="grid" style="grid-template-rows: auto; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div>
                            <p class="fg0">Term</p>
                            <p class="{
                                term.term.trim().split("\n")[0].length <= 20 ?
                                    "shy-h4" : ""
                            }" style="margin-top: 0px;">{term.term.trim().split("\n")[0]}{
                                term.term.length > term.term.trim().split("\n")[0].length ?
                                    "..." : ""
                                }</p>
                            </div>
                            <div>
                            <p class="fg0">Definition</p>
                            <p class="{
                                term.def.trim().split("\n")[0].length <= 20 ?
                                    "shy-h4" : ""
                            }" style="margin-top: 0px;">{term.def.trim().split("\n")[0]}{
                                term.def.length > term.def.trim().split("\n")[0].length ?
                                    "..." : ""
                                }</p>
                            </div>
                        </div>
                        {#if !(term.progress && (
                            term.progress.termCorrectCount > 0 ||
                            term.progress.termIncorrectCount > 0 ||
                            term.progress.defCorrectCount > 0 ||
                            term.progress.defIncorrectCount > 0
                        ))}
                        <div class="flex" style="justify-content: center;">
                            <span class="fg0">New/Unreviewed</span>
                        </div>
                        {/if}
                        {#if term.progress && (
                            term.progress.termCorrectCount > 0 ||
                            term.progress.termIncorrectCount > 0 ||
                            term.progress.defCorrectCount > 0 ||
                            term.progress.defIncorrectCount > 0
                        )}
                        <div class="flex" style="margin-top: 0.6rem;">
                            <div>
                                <p class="fg0" style="margin-top: 0px; margin-bottom: 0px;">Avg Accuracy:</p>
                                <p class="shy-h4 b {
                                    averageAccuracy(
                                        term.progress.termCorrectCount,
                                        term.progress.termIncorrectCount,
                                        term.progress.defCorrectCount,
                                        term.progress.defIncorrectCount
                                    ) > 0.9 ?
                                        "yay" : "ohno"
                                }" style="margin-top: 0px;">
                                    {averageAccuracy(
                                        term.progress.termCorrectCount,
                                        term.progress.termIncorrectCount,
                                        term.progress.defCorrectCount,
                                        term.progress.defIncorrectCount
                                    )}%
                                </p>
                            </div>
                            <div>
                                <p class="fg0" style="margin-top: 0px; margin-bottom: 0px;">Term Accuracy:</p>
                                {#if term.progress.termCorrectCount +
                                    term.progress.termIncorrectCount > 0
                                }
                                <p class="shy-h4 b {
                                    term.progress.termCorrectCount / (
                                        term.progress.termCorrectCount +
                                        term.progress.termIncorrectCount
                                    ) > 0.9 ?
                                        "yay" : "ohno"
                                }" style="margin-top: 0px;">
                                    {Math.floor(
                                        term.progress.termCorrectCount / (
                                            term.progress.termCorrectCount +
                                            term.progress.termIncorrectCount
                                        ) * 100
                                    )}%
                                </p>
                                {:else}
                                <p class="fg0 shy-h4">N/A</p>
                                {/if}
                            </div>
                            <div>
                                <p class="fg0" style="margin-top: 0px; margin-bottom: 0px;">Def Accuracy:</p>
                                {#if term.progress.defCorrectCount +
                                    term.progress.defIncorrectCount > 0
                                }
                                <p class="shy-h4 b {
                                    term.progress.defCorrectCount / (
                                        term.progress.defCorrectCount +
                                        term.progress.defIncorrectCount
                                    ) > 0.9 ?
                                        "yay" : "ohno"
                                }" style="margin-top: 0px;">
                                    {Math.floor(
                                        term.progress.defCorrectCount / (
                                            term.progress.defCorrectCount +
                                            term.progress.defIncorrectCount
                                        ) * 100
                                    )}%
                                </p>
                                {:else}
                                <p class="fg0 shy-h4" style="margin-top: 0px;">N/A</p>
                                {/if}
                            </div>
                        </div>
                        <div class="flex" style="justify-content: center;">
                            <a href="{
                                data.local ?
                                    `/studyset/local/stats/term?id=${term.id}&studysetId=${data?.localId}` :
                                    `/studysets/${data.studysetId}/stats/terms/${term.id}`
                            }" style="display: flex; flex-wrap: nowrap; align-items: center; gap: 0.4rem;">
                                <StatsIcon></StatsIcon>
                                <span style="margin-top: 0px;">View Details</span>
                            </a>
                        </div>
                        {/if}
                    </div>
                    {/if}
                {/each}
                {#if terms?.length > COLLAPSED_TERMS_COUNT}
                <button class="button-box" style="width: 100%;" onclick={
                    () => showAllTerms = !showAllTerms
                }>
                    {#if showAllTerms}
                    Collapse Terms
                    {:else}
                    Show All Terms
                    {/if}
                </button>
                {/if}
            </div>
            <div class="practice-tests-chart-area">
{#if practiceTests?.length > 1}
    <div class="chart-container">
        <canvas bind:this={chartCanvas}></canvas>
    </div>
{/if}
            </div>
            <div class="practice-tests-area">
                    <p class="h4" bind:this={practiceTestsHeader}>Practice Tests</p>
                {#if practiceTests?.length > 0}
                    {#each practiceTests as practiceTest, index}
                        {#if index < COLLAPSED_PRACTICE_TESTS_COUNT || showAllPracticeTests}
                        <div class="box" transition:slide={{duration: 600}}>
                            <div class="grid gridfourpartthingrow">
                                <span class="b fourpartthing-one {
                                    Math.floor((practiceTest.questionsCorrect / practiceTest.questionsTotal) * 100) >= 90 ?
                                        "yay" : "ohno"
                                }">{Math.floor((practiceTest.questionsCorrect / practiceTest.questionsTotal) * 100)}%</span>
                                <span class="fourpartthing-two">{practiceTest.questionsCorrect}/{practiceTest.questionsTotal}</span>
                                <span class="fourpartthing-three">{mounted ? fancyTimestamp.format(practiceTest.timestamp) : "..."}</span>
                                <a href="{
                                    data.authed && !data.local ?
                                        `/practice-tests/${practiceTest.id}` :
                                        `/practice-test/local?id=${practiceTest.id}`
                                }" class="fourpartthing-four" style="display: flex; align-items: center; gap: 0.4rem;">
                                    <span>View Details</span>
                                    <ForwardLongArrowIcon class="no-margin-top"></ForwardLongArrowIcon>
                                </a>
                            </div>
                        </div>
                        {/if}
                    {/each}
                    {#if practiceTests?.length > COLLAPSED_PRACTICE_TESTS_COUNT}
                    <button class="button-box" style="width: 100%;" onclick={
                        () => showAllPracticeTests = !showAllPracticeTests
                    }>
                        {#if showAllPracticeTests}
                            Collapse Practice Tests
                        {:else}
                            Show All Practice Tests
                        {/if}
                    </button>
                    {/if}
                {:else}
                    <div class="box center text fg0">Completed practice tests will show up here</div>
                {/if}
            </div>
        </div>
    </div>
</div>
