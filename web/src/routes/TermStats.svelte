<script>
    import { onMount } from "svelte";
    import db from "$lib/idb-api-layer/db.js";
    import idbApiLayer from "$lib/idb-api-layer/idb-api-layer.js";
    import averageAccuracy from "$lib/average-accuracy.js";
    import Chart from 'chart.js/auto';
    import 'chartjs-adapter-luxon';
    import { fancyTimestamp } from "$lib/fancyTimestamp";
    import BackIcon from "$lib/icons/BackArrow.svelte"
    import ForwardLongArrowIcon from "$lib/icons/ForwardRightArrowLong.svelte"
    import StatsIcon from "$lib/icons/ChartGraphLine.svelte"
    import { slide } from "svelte/transition";
    let { data } = $props();
    let term = $state();

    let topConfusionPairsUniqueArray = $state([]);
    let topReverseConfusionPairsUniqueArray = $state([]);
    function combineConfusionPairs() {
        let topConfusionPairsUnique = new Map();
        let topReverseConfusionPairsUnique = new Map();

        term?.topConfusionPairs?.forEach(pair => {
            let obj = {
                confusedTerm: pair.confusedTerm
            };
            if (pair?.answeredWith == "DEF") {
                obj.defConfusedCount = pair.confusedCount;
            } else {
                obj.termConfusedCount = pair.confusedCount;
            }

            topConfusionPairsUnique.set(
                pair.confusedTerm.id,
                {
                    ...topConfusionPairsUnique.get(pair.confusedTerm.id),
                    ...obj
                }
            )
        })
        topConfusionPairsUniqueArray = [...topConfusionPairsUnique.values()];

        term?.topReverseConfusionPairs?.forEach(pair => {
            let obj = {
                term: pair.term
            };
            if (pair?.answeredWith == "DEF") {
                obj.defConfusedCount = pair.confusedCount;
            } else {
                obj.termConfusedCount = pair.confusedCount;
            }

            topReverseConfusionPairsUnique.set(
                pair.term.id,
                {
                    ...topReverseConfusionPairsUnique.get(pair.term.id),
                    ...obj
                }
            )
        })
        topReverseConfusionPairsUniqueArray = [...topReverseConfusionPairsUnique.values()];
    }

    if (!data.local) {
        term = data?.term;
        combineConfusionPairs();
    }

    let chartCanvas;

    let mounted = $state(false);
    onMount(async () => {
        mounted = true;
        if (data?.settingsDateTimeFmtHours == "24") {
            fancyTimestamp.hours = 24;
        } else if (data?.settingsDateTimeFmtHours == "12") {
            fancyTimestamp.hours = 12;
        }

        if (data.local) {
            term = await idbApiLayer.getTermById(data.localTermId, {
                progress: true,
                progressHistory: true,
                topConfusionPairs: {
                    confusedTerm: true
                },
                topReverseConfusionPairs: {
                    term: true
                }
            })

            combineConfusionPairs();
        }

        if (!data.authed && !data.local) {
            /* not logged in, so user data is local,
            but studyset is a cloud studyset,
            so we need to map local progress to cloud terms

            `term` has already been populated during SSR (above, before onMount) */
            term.progress = (await db.termProgress.where("termId").equals(term.id).toArray())?.[0];
            term.topConfusionPairs = await idbApiLayer.getTopConfusionPairs(term.id)
            term.topReverseConfusionPairs = await idbApiLayer.getTopReverseConfusionPairs(term.id)

            combineConfusionPairs();
        }

        Chart.defaults.font.size = 16;
        const rootStyles = getComputedStyle(document.documentElement);
        const mainColor = rootStyles.getPropertyValue("--main").trim();
        const fg1Color = rootStyles.getPropertyValue("--fg-1").trim();
        const bg2Color = rootStyles.getPropertyValue("--bg-2").trim();
        const borderColor = rootStyles.getPropertyValue("--border").trim();
        const extraColor = rootStyles.getPropertyValue("--extra").trim();
        Chart.defaults.backgroundColor = mainColor;
        Chart.defaults.borderColor = borderColor;
        Chart.defaults.color = fg1Color;
        new Chart(
            chartCanvas,
            {
                type: "line",
                data: {
                    datasets: [{
                        label: "Term Accuracy",
                        fill: false,
                        tension: 0,
                        borderColor: mainColor,
                        backgroundColor: mainColor,
                        pointStyle: "circle",
                        pointRadius: 6,
                        pointHoverRadius: 8,
                        data: (() => {
                            let data = [];
                            term?.progressHistory?.forEach(ph => {
                                if (ph.termCorrectCount + ph.termIncorrectCount > 0) {
                                    data.push({
                                        x: Date.parse(ph.timestamp),
                                        y: ph.termCorrectCount / (
                                            ph.termCorrectCount +
                                            ph.termIncorrectCount
                                        )
                                    })
                                }
                            });
                            return data;
                        })()
                    }, {
                        label: "Definition Accuracy",
                        fill: false,
                        tension: 0,
                        borderColor: extraColor,
                        backgroundColor: extraColor,
                        pointStyle: "circle",
                        pointRadius: 6,
                        pointHoverRadius: 8,
                        data: (() => {
                            let data = [];
                            term?.progressHistory?.forEach(ph => {
                                if (ph.defCorrectCount + ph.defIncorrectCount > 0) {
                                    data.push({
                                        x: Date.parse(ph.timestamp),
                                        y: ph.defCorrectCount / (
                                            ph.defCorrectCount +
                                            ph.defIncorrectCount
                                        )
                                    })
                                }
                            });
                            return data;
                        })()
                    }]
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
                            suggestedMax: 1,
                            suggestedMin: 0,
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
                                boxWidth: 16,
                                boxHeight: 16,
                                useBorderRadius: true,
                                borderRadius: 8
                            }
                        }
                    }
                }
            }
        );
    })
</script>
<style>
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

    .twogridthings {
        display: grid;
        gap: 1rem;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: auto;
    }
    @media only screen and (max-width: 800px) {
        .twogridthings {
            grid-template-columns: auto;
            grid-template-rows: auto auto;
        }
    }

    .shy-h3 {
        font-size: 1.4rem;
    }
    .shy-h4 {
        font-size: 1.2rem;
    }
</style>
<div class="grid page">
    <div class="content">
        <div class="flex">
            <a class="button faint" href={data.local ?
                `/studyset/local/stats?id=${data.localStudysetId}` :
                `/studysets/${data.studysetId}/stats`
            }>
                <BackIcon></BackIcon>
                Back
            </a>
        </div>
        <div class="chart-container">
            <canvas bind:this={chartCanvas}></canvas>
        </div>
        <div class="grid twogridthings" style="margin-top: 2rem;">
            <div>
                <p class="fg0">Term</p>
                <p class="shy-h3" style="margin-top: 0px;">{term?.term}</p>
            </div>
            <div>
                <p class="fg0">Definition</p>
                <p class="shy-h3" style="margin-top: 0px;">{term?.def}</p>
            </div>
        </div>
        {#if term?.progress && (
            term.progress.termCorrectCount > 0 ||
            term.progress.termIncorrectCount > 0 ||
            term.progress.defCorrectCount > 0 ||
            term.progress.defIncorrectCount > 0
        )}
            <div class="flex">
                <div>
                    <p class="fg0" style="margin-top: 0px; margin-bottom: 0px;">Average Accuracy:</p>
                    <p class="shy-h4 b {
                        averageAccuracy(
                            term.progress.termCorrectCount,
                            term.progress.termIncorrectCount,
                            term.progress.defCorrectCount,
                            term.progress.defIncorrectCount
                        ) > 90 ?
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
                    <p class="fg0" style="margin-top: 0px; margin-bottom: 0px;">Answering-With-Term Accuracy:</p>
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
                        <p class="fg0 shy-h4" style="margin-top: 0px;">N/A</p>
                    {/if}
                </div>
                <div>
                    <p class="fg0" style="margin-top: 0px; margin-bottom: 0px;">Answering-With-Definition Accuracy:</p>
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
            <div class="flex">
                <div>
                    <p class="fg0">Last Reviewed</p>
                    {#if term?.progress?.termLastReviewedAt || term?.progress?.defLastReviewedAt}
                        <p class="shy-h4" style="margin-top: 0px;">{mounted ? (
                            fancyTimestamp.format(
                                Math.max(
                                    Date.parse(term?.progress?.termLastReviewedAt) || 0,
                                    Date.parse(term?.progress?.defLastReviewedAt) || 0
                                )
                            )
                        ) : ""}</p>
                    {/if}
                </div>
            </div>
            <p class="h4" style="margin-top: 2rem;">Frequently Confused Terms</p>
            <p class="fg0">These terms are frequently selected incorrect answers.</p>
            <div>
                {#each topConfusionPairsUniqueArray as confusionPair }
                    <div class="box">
                        {confusionPair.confusedTerm?.term}
                    </div>
                {:else}
                    <div class="box center text fg0">
                        (None)
                    </div>
                {/each}
            </div>
            <p class="h4" style="margin-top: 2rem;">Reverse-Confused Terms</p>
            <p class="fg0">This term is a frequently selected incorrect answer for these terms.</p>
            <div>
                {#each term?.topReverseConfusionPairs as confusionPair }
                    <div class="box">
                        {confusionPair.term?.term}
                    </div>
                {:else}
                    <div class="box center text fg0">
                        (None)
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</div>
