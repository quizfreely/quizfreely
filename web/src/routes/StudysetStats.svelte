<script>
    import { onMount } from "svelte";
    import Chart from 'chart.js/auto';
    import 'chartjs-adapter-luxon';
    import { setEhuiChartColors } from "$lib/ehui-chartjs-colors.js";
    import { fancyTimestamp } from "$lib/fancyTimestamp";
    import ForwardLongArrowIcon from "$lib/icons/ForwardRightArrowLong.svelte"
    let { data } = $props();
    let terms = $state();
    let practiceTests = $state([]);
    const DISPLAY_TOP_N_PRACTICE_TESTS = 4;

    if (!data.local) {
        console.log(data.studyset)
        terms = data?.studyset?.terms;
        practiceTests = data?.studyset?.practiceTests?.slice(0, DISPLAY_TOP_N_PRACTICE_TESTS);
    }

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
                practiceTests = studyset?.practiceTests?.slice(0, DISPLAY_TOP_N_PRACTICE_TESTS);
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
                practiceTests = practiceTests?.slice(0, DISPLAY_TOP_N_PRACTICE_TESTS);

                for (const term of terms) {
                    term.progress = await db.termProgress.where("termId").equals(term.id).toArray()?.[0];
                    term.topConfusionPairs = await idbApiLayer.getTopConfusionPairs(term.id)
                    term.topReverseConfusionPairs = await idbApiLayer.getTopReverseConfusionPairs(term.id)
                }
            })();
        }

        const rootStyles = getComputedStyle(document.documentElement);
        const mainColor = rootStyles.getPropertyValue("--main").trim();
        const fg1Color = rootStyles.getPropertyValue("--fg-1").trim();
        const bg2Color = rootStyles.getPropertyValue("--bg-2").trim();
        const borderColor = rootStyles.getPropertyValue("--border").trim();
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
                                pointHoverRadius: 6,
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
                                suggestedMax: Date.now()
                            },
                            y: {
                                ticks: {
                                    stepSize: 0.1,
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
                                labels: {
                                    usePointStyle: true
                                }
                            }
                        }
                    }
                }
            );
        }
    })
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
</style>
<div class="grid page">
    <div class="content">
{#if practiceTests?.length > 1}
    <div class="chart-container">
        <canvas bind:this={chartCanvas}></canvas>
    </div>
{/if}
                {#if practiceTests?.length > 0}
                    <p class="h4" style="margin-top: 2rem;">Practice Tests</p>
                    {#each practiceTests as practiceTest}
                        <div class="box">
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
                    {/each}
                {/if}
    </div>
</div>
