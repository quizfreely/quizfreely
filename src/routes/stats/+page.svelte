<script>
    import { onMount } from "svelte";
    import { fancyTimestamp } from "$lib/fancyTimestamp";
    import { idbApiLayer, db } from "$lib/idb-api-layer";
    import averageAccuracy from "$lib/average-accuracy.js";
	import { LineChart, Spline, Axis, Bar, Chart, Highlight, Layer, Rule, Tooltip, defaultChartPadding } from 'layerchart';
    import { curveMonotoneX } from "d3-shape";
	import { scaleBand } from 'd3-scale';
	import { backOut, cubicOut } from 'svelte/easing';
    import { slide } from "svelte/transition";
    import BackIcon from "$lib/icons/BackArrow.svelte"
    import ForwardLongArrowIcon from "$lib/icons/ForwardRightArrowLong.svelte"
    import AngleUpIcon from "$lib/icons/AngleUp.svelte";
    import AngleDownIcon from "$lib/icons/AngleDown.svelte";
    import StatsIcon from "$lib/icons/ChartGraphLine.svelte";
    import { SvelteMap } from 'svelte/reactivity';
    let { data } = $props();

    let terms = $state([]);
    let practiceTests = $state([]);
    let reviewEventStats = $state([]);
    let studysetTotals = new SvelteMap();
    if (data?.studysets != null) {
        const newTerms = [];
        const newPTs = [];
        const newREs = [];
        // use a Set to remove duplicates
        // because one PT can be under multiple studysets
        const ptSet = new Set();
        for (const s of data.studysets) {
            if (s == null) continue;
            let totalDefCorrect = 0;
            let totalDefIncorrect = 0;
            let totalTermCorrect = 0;
            let totalTermIncorrect = 0;
            if (s.terms != null) {
                for (const t of s.terms) {
                    if (t == null) continue;
                    t.studysetId = s.id;
                    newTerms.push(t);
                    if (t.progress != null) {
                        totalDefCorrect += t.progress.defCorrectCount;
                        totalDefIncorrect += t.progress.defIncorrectCount;
                        totalTermCorrect += t.progress.termCorrectCount;
                        totalTermIncorrect += t.progress.termIncorrectCount;
                    }
                }
            }
            studysetTotals.set(s.id, {
                id: s.id,
                title: s.title,
                totalDefCorrect,
                totalDefIncorrect,
                totalTermCorrect,
                totalTermIncorrect,
            });
            if (s.practiceTests != null) {
                for (const pt of s.practiceTests) {
                    if (pt?.id == null || ptSet.has(pt.id)) continue;
                    ptSet.add(pt.id);
                    newPTs.push(pt);
                }
            }
            if (s.reviewEventStatsByDay != null) {
                for (const re of s.reviewEventStatsByDay) {
                    if (re == null) continue;
                    // duplicate RE timestamps are merged later in onMount
                    newREs.push(re);
                }
            }
        }
        // NOTE: local arrays, so 1 reactive update at the end
        // instead of multiple reactive updates each loop
        terms.push(...newTerms);
        practiceTests.push(...newPTs);
        practiceTests.sort(
            (a, b) => b.timestamp.localeCompare(a.timestamp),
        );
        reviewEventStats.push(...newREs);
    }
    const termsStats = $derived.by(() => {
        if (terms) {
            let sum = 0;
            let includedTermsCount = 0;
            let unreviewedCount = 0;
            for (const term of terms) {
                if (term.progress && (
                    term.progress.termCorrectCount > 0 ||
                    term.progress.termIncorrectCount > 0 ||
                    term.progress.defCorrectCount > 0 ||
                    term.progress.defIncorrectCount > 0
                )) {
                    sum += averageAccuracy(
                        term.progress.termCorrectCount,
                        term.progress.termIncorrectCount,
                        term.progress.defCorrectCount,
                        term.progress.defIncorrectCount
                    )
                    includedTermsCount++;
                } else {
                    unreviewedCount++;
                }
            }
            return {
                avgAccuracy: Math.floor(sum / includedTermsCount),
                unreviewedCount: unreviewedCount
            }
        } else {
            return null;
        }
    })
    const practiceTestAvgScore = $derived.by(() => {
        if (practiceTests?.length > 0) {
            let sum = 0;
            for (const practiceTest of practiceTests) {
                sum += practiceTest.questionsCorrect / practiceTest.questionsTotal * 100
            }
            return Math.floor(sum / practiceTests.length);
        } else {
            return -1;
        }
    })

    let fancyTimestampReady = $state(false);
    let ptChartData = $state([]);
    let reChartData = $state([]);
    onMount(() => {
        let objectUrls = [];
        (async () => {
            try {
                const fmtHours = window.localStorage.getItem("quizfreely:fmt_hours");
                if (fmtHours == "24") {
                    fancyTimestamp.hours = 24;
                } else if (fmtHours == "12") {
                    fancyTimestamp.hours = 12;
                }
            } catch (err) {
                console.log("No localStorage? 😭 Err:", err);
            }
            fancyTimestampReady = true;
        })();
        (async () => {
            if (data.localIds.length > 0) {
                /* at least one studyset is local, so regardless of wheater the user is logged in or not,
                we load those studysets and progress locally */
                const localStudysets = await idbApiLayer.getStudysetsByIds(data.localIds, {
                    terms: {
                        progress: true,
                        termImageUrl: true,
                        defImageUrl: true
                    },
                    practiceTests: true,
                    reviewEventStatsByDay: {
                        lastDaysTotal: 30,
                    }
                });
                if (localStudysets != null) {
                    const newTerms = [];
                    const newPTs = [];
                    const newREs = [];
                    // use a Set to remove duplicates
                    // because one PT can be under multiple studysets
                    const ptSet = new Set();
                    for (const s of localStudysets) {
                        if (s == null) continue;
                        let totalDefCorrect = 0;
                        let totalDefIncorrect = 0;
                        let totalTermCorrect = 0;
                        let totalTermIncorrect = 0;
                        if (s.terms != null) {
                            for (const t of s.terms) {
                                if (t == null) continue;
                                t.studysetId = s.id;
                                newTerms.push(t);
                                // track local term images for cleanup
                                if (t.termImageUrl != null) {
                                    objectUrls.push(t.termImageUrl);
                                }
                                if (t.defImageUrl != null) {
                                    objectUrls.push(t.defImageUrl);
                                }
                                // track progress to mutate properties before adding to `studysetTotals`
                                if (t.progress != null) {
                                    totalDefCorrect += t.progress.defCorrectCount;
                                    totalDefIncorrect += t.progress.defIncorrectCount;
                                    totalTermCorrect += t.progress.termCorrectCount;
                                    totalTermIncorrect += t.progress.termIncorrectCount;
                                }
                            }
                        }
                        studysetTotals.set(s.id, {
                            id: s.id,
                            title: s.title,
                            totalDefCorrect,
                            totalDefIncorrect,
                            totalTermCorrect,
                            totalTermIncorrect,
                        });
                        
                        if (s.practiceTests != null) {
                            for (const pt of s.practiceTests) {
                                if (pt?.id == null || ptSet.has(pt.id)) continue;
                                ptSet.add(pt.id);
                                newPTs.push(pt);
                            }
                        }
                        if (s.reviewEventStatsByDay != null) {
                            for (const re of s.reviewEventStatsByDay) {
                                if (re == null) continue;
                                // duplicate RE timestamps are merged later in onMount
                                newREs.push(re);
                            }
                        }
                    }
                    // NOTE: local arrays, so 1 reactive update at the end
                    // instead of multiple reactive updates each loop
                    terms.push(...newTerms);
                    practiceTests.push(...newPTs);
                    practiceTests.sort(
                        (a, b) => b.timestamp.localeCompare(a.timestamp),
                    );
                    reviewEventStats.push(...newREs);
                }
            }

            if (!data.authed && data.cloudIds.length > 0) {
                /* not logged in, so user data is local,
                but at least one set is a cloud studyset,
                so we need to map local progress to cloud terms

                `terms` has already been populated during SSR (above, before onMount) */
                practiceTests.push(...(await db.practiceTests.where("studysetIds").anyOf(data.cloudIds).toArray() ?? []));
                practiceTests.sort(
                    /* timestamps are ISO strings in UTC,
                    so lexical/alphanumeric sorting is the same as chronological sorting
                    also you see we're comparing `b` to `a`, so its descending,
                    so most recent is first */
                    (a, b) => b.timestamp.localeCompare(a.timestamp)
                );

                const termIds = terms.map(t => t.id);
                reviewEventStats.push(...(await idbApiLayer.getReviewEventStatsByDay({
                    lastDaysTotal: 30,
                    termIds: termIds,
                })?.filter?.(d => d != null) ?? []));

                for (const term of terms) {
                    if (term.progress == null) {
                        term.progress = (await db.termProgress.where("termId").equals(term.id).toArray())?.[0];
                        if (term.progress != null && term.studysetId != null) {
                            const s = studysetTotals.get(term.studysetId);
                            if (s != null) {
                                s.totalDefCorrect += term.progress.defCorrectCount;
                                s.totalDefIncorrect += term.progress.defIncorrectCount;
                                s.totalTermCorrect += term.progress.termCorrectCount;
                                s.totalTermIncorrect += term.progress.termIncorrectCount;
                                studysetTotals.set(term.studysetId, s);
                            }
                        }
                    }
                }
            }

            if (practiceTests != null) {
                ptChartData = practiceTests
                    .filter(p => p.questionsTotal > 0)
                    .reverse() /* reverse gives us correct order for layerchart draw animation */
                    .map( (pt, i) => ({
                        date: new Date(pt.timestamp),
                        score: pt.questionsCorrect / pt.questionsTotal,
                        x: i
                    })); 
            }
            const reByDate = new Map();
            for (const d of reviewEventStats) {
                const existing = reByDate.get(d.timestamp);
                if (existing) {
                    existing.correct += d.correct;
                    existing.incorrect += d.incorrect;
                } else {
                    reByDate.set(d.timestamp, {
                        ...d,
                        date: new Date(d.timestamp),
                    });
                }
            }
            reChartData = [...reByDate.values()];
        })();
        return () => {
            objectUrls.forEach(objectUrl => {
                URL.revokeObjectURL(objectUrl);
            });
        }
    })

    let showAllTerms = $state(false);
    const COLLAPSED_TERMS_COUNT = 3;
    let showAllPracticeTests = $state(false);
    const COLLAPSED_PRACTICE_TESTS_COUNT = 3;

    function fmtDateShort(d) {
        const t = d?.getTime?.();
        if (t == null || Number.isNaN(t)) {
            // NOTE: return empty string if invalid
            // because this func is called with null for empty graphs
            return "";
        }
        return `${d.getMonth()+1}/${d.getDate()}`
    }
    
    const days = [
        "Sun", "Mon", "Tue", "Wed",
        "Thu", "Fri", "Sat"
    ];
    const months = [
        "Jan", "Feb", "Mar", "Apr",
        "May", "Jun", "Jul", "Aug",
        "Sep", "Oct", "Nov", "Dec"
    ];
    function fmtDate(d) {
        const t = d?.getTime?.();
        if (t == null || Number.isNaN(t)) {
            return "";
        }
        return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`
    }
    const ssAccChartData = $derived.by(() => {
        const newSsAccChartData = Array.from(studysetTotals, ([k, s]) => {
            const totalCorrect = (s.totalDefCorrect + s.totalTermCorrect) ?? 0;
            let totalTotal = totalCorrect + ((s.totalDefIncorrect + s.totalTermIncorrect) ?? 0);
            if (totalTotal < 1) {
                totalTotal = 1;
            }
            return {
                id: s.id,
                title: s.title,
                titleShort: s.title?.length > 30 ? `${s.title?.slice(0, 30)}...` : s.title,
                accuracy: Math.round((totalCorrect / totalTotal) * 100),
            };
        });
        newSsAccChartData.sort((a, b) => b.accuracy - a.accuracy);
        /* loop again AFTER SORTING because index is updated */
        newSsAccChartData.forEach((d, index) => {
            d.index = index;
        });
        return newSsAccChartData;
    });
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

    .grid-split-but-different {
        display: grid;
        gap: 2rem;
        row-gap: 3rem;
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
    .qzfr-combined-studyset-stats-grid,
    .grid.qzfr-combined-studyset-stats-grid {
        column-gap: 1rem;
        row-gap: 2rem;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: auto;
    }
    @media only screen and (max-width: 1000px) {
        .grid-split-but-different {
            gap: 2rem;
            row-gap: 4rem;
            grid-template-columns: auto;
            grid-template-rows: auto auto auto auto;
            grid-template-areas:
                "terms-chart"
                "terms"
                "practice-tests-chart"
                "practice-tests";
        }
        .qzfr-combined-studyset-stats-grid,
        .grid.qzfr-combined-studyset-stats-grid {
            grid-template-columns: auto;
            grid-template-rows: auto auto;
        }
    }

    .shy-h4 {
        font-size: 1.2rem;
    }
    .term-image {
        max-width: 300px;
        max-height: 200px;
        margin: 0px;
        padding: 0px;
        border-radius: 0.8rem;
    }

    .termdeftxt {
        white-space: pre-wrap;
        overflow-wrap: break-word;
    }
</style>
<svelte:head>
    <title>Studyset Stats | Quizfreely</title>
</svelte:head>
<div class="grid page">
    <div class="content">
        <div class="flex">
            <a class="button faint" href={
                data.cloudIds.length + data.localIds.length > 1 ?
                    `/combine?${[
                        ...data.cloudIds.map((id) => `studyset=${id}`),
                        ...data.localIds.map((id) => `localStudyset=${id}`),
                    ].join("&")}` :
                    data.cloudIds.length == 1 ?
                        `/studysets/${data.cloudIds[0]}` :
                        data.localIds.length == 1 ?
                            `/studyset/local?id=${data.localIds[0]}` : ""
            }>
                <BackIcon></BackIcon>
                Back
            </a>
        </div>
        <div class="grid qzfr-combined-studyset-stats-grid" style="margin-bottom: 2rem;">
            <div>
                <p class="center">Average Accuracy by Studyset</p>
                {const ssAccHeight = $derived(Math.min(200 + 40*(ssAccChartData.length - 2), 500))}
                <div style="min-height: {ssAccHeight}px;">
                    <Chart
                        data={ssAccChartData}
                        y="index"
                        yScale={scaleBand().padding(0.6)}
                        x="accuracy"
                        xDomain={[0, null]}
                        xNice
                        padding={{ left: 100, top: 0, bottom: 20, right: 20 }}
                        height={ssAccHeight}
                        tooltipContext={{ mode: 'band' }}
                    >
	                    <Layer>
		                    <Axis placement="left" rule format={(index) => ssAccChartData[index].titleShort} />
		                    <Axis placement="bottom" grid rule format={(v) => `${v}%`} />
                            {#each ssAccChartData as d, i}
                                <Bar
                                    data={d}
                                    rounded="right"
                                    radius={8}
                                    motion={{
                                        type: 'tween',
                                        duration: 400,
                                        easing: backOut,
                                        delay: i * 80
                                    }}
                                    fill={d.accuracy >= 90 ? "var(--yay)" : (d.accuracy >= 80 ? "var(--warn)" : "var(--ohno)")}
                                />
                            {/each}
		                    <Highlight area />
	                    </Layer>
		                <Tooltip.Root>
			                {#snippet children({ data })}
				                <Tooltip.Header value={data.title} format={(v) => v} style="max-width: 240px; white-space: normal; overflow-wrap: break-word;" />
				                <Tooltip.List>
					                <Tooltip.Item
						                label="Accuracy"
						                value={data.accuracy}
                                        format={(v) => `${v}%`}
					                />
				                </Tooltip.List>
			                {/snippet}
		                </Tooltip.Root>
                    </Chart>
                </div>
            </div>
            <div>
                <p class="center">{ssAccChartData.length} Studysets</p>
                <div class="flex" style="flex-direction: column; gap: 0.4rem; flex-wrap: nowrap; max-height: 500px; overflow-y: auto; padding-right: 6px; border-radius: 0.8rem;">
                    {#each ssAccChartData as d}
                        <div class="box flex" style="padding: 0.6rem 1rem; align-items: center; justify-content: space-between;">
                            <span>{d.title}</span>
                            <div class="flex" style="align-items: center;">
                                <span class="text {d.accuracy >= 90 ? 'yay' : (d.accuracy >= 80 ? 'warn' : 'ohno')}">{d.accuracy}%</span>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        </div>
<div class="grid grid-split-but-different">
            <div class="terms-chart-area">
        <div class="flex center">Terms/Questions per Day</div>
<div style="min-height: 300px;"> <!-- wrapper div to keep height while loading, to eliminate layout shift -->
<Chart
	data={reChartData}
	x="date"
	xScale={scaleBand().padding(0.4)}
	y={['correct', (d) => -d.incorrect]}
	yNice
	padding={defaultChartPadding({ right: 10 })}
    tooltipContext={{ mode: 'band' }}
	height={300}
>
	{#snippet children({ context })}
		<Layer>
			<Axis placement="left" grid rule ticks={(s) => s.ticks?.().filter(Number.isInteger)} format={(d) => Math.abs(d)} />
			<Axis placement="bottom" rule format={fmtDateShort} />
				{#each reChartData as d, i}
                    {const barWidth = $derived(Math.min(context.xScale.bandwidth?.() ?? 24, 24))}
                    <Bar
                    	data={d}
                        width={barWidth}
                    	y="correct"
                    	rounded="top"
                        radius={8}
                    	style="fill: var(--yay);"
                    	motion={{ type: 'tween', duration: 400, easing: backOut, delay: i * 60 }}
                    	initialY={context.yScale(0)}
                    />
                    <Bar
                    	data={d}
                        width={barWidth}
                    	y={(d) => -d.incorrect}
                    	rounded="bottom"
                        radius={8}
                    	style="fill: var(--ohno);"
                    	motion={{ type: 'tween', duration: 400, easing: backOut, delay: i * 60 }}
                    	initialY={context.yScale(0)}
                    />
				{/each}
			<Rule y={0} />
			<Highlight area />
		</Layer>

		<Tooltip.Root>
			{#snippet children({ data })}
				<Tooltip.Header value={data.date} format={fmtDate} />
				<Tooltip.List>
					<Tooltip.Item
						label="correct"
						value={data.correct}
						color="var(--yay)"
					/>
					<Tooltip.Item
						label="incorrect"
						value={data.incorrect}
						color="var(--ohno)"
					/>
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
</div>
            </div>
            <div class="terms-area">
                <div class="flex" style="align-items: end; justify-content: space-between; flex-wrap: wrap; row-gap: 0.2rem;">
                    <p class="h4" style="margin-bottom: 0px;">Terms</p>
                    <div class="flex" style="row-gap: 0.2rem;">
                        {#if terms?.length > 0 && termsStats != null && !isNaN(termsStats.avgAccuracy)}
                        <span class={
                            termsStats?.avgAccuracy >= 90 ?
                                "yay" : (termsStats?.avgAccuracy >= 80 ? "warn" : "ohno")
                        }>{termsStats?.avgAccuracy}% average accuracy</span>
                        {/if}
                        <span class="fg0">{termsStats?.unreviewedCount ?? 0} new/unreviewed</span>
                        <span class="fg0">{terms?.length ?? 0} total</span>
                    </div>
                </div>
                {#each terms as term, index}
                    {#if index < COLLAPSED_TERMS_COUNT || showAllTerms}
                    <div class="box" transition:slide={{duration: 600}}>
                        <div class="grid" style="grid-template-rows: auto; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 1rem; max-width: 100%;">
                            <div>
                            <p class="fg0">Term</p>
                            <p class="termdeftxt {
                                term.term.length <= 20 ?
                                    "shy-h4" : ""
                            }" style="margin-top: 0px;">{term.term}</p>
                            {#if term.termImageUrl != null}
                            <div><img src={term.termImageUrl} alt="term image" class="term-image"></div>
                            {/if}
                            </div>
                            <div>
                            <p class="fg0">Definition</p>
                            <p class="termdeftxt {
                                term.def.length <= 20 ?
                                    "shy-h4" : ""
                            }" style="margin-top: 0px;">{term.def}</p>
                            {#if term.defImageUrl != null}
                            <div><img src={term.defImageUrl} alt="definition image" class="term-image"></div>
                            {/if}
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
                                <p class="fg0" style="margin-top: 0px; margin-bottom: 0px;">Average Accuracy:</p>
                                {const avgAccTsTerm = $derived(
                                    averageAccuracy(
                                        term.progress.termCorrectCount,
                                        term.progress.termIncorrectCount,
                                        term.progress.defCorrectCount,
                                        term.progress.defIncorrectCount,
                                    ),
                                )}
                                <p class="shy-h4 b {
                                     avgAccTsTerm >= 90 ?
                                        "yay" : (avgAccTsTerm >= 80 ? "warn" : "ohno")
                                }" style="margin-top: 0px;">
                                    {avgAccTsTerm}%
                                </p>
                            </div>
                            <div>
                                <p class="fg0" style="margin-top: 0px; margin-bottom: 0px;">Term-to-Def:</p>
                                {#if term.progress.defCorrectCount +
                                    term.progress.defIncorrectCount > 0
                                }
                                    {const ttdAccTsTerm = $derived(
                                        Math.floor(
                                            term.progress.defCorrectCount / (
                                                term.progress.defCorrectCount +
                                                term.progress.defIncorrectCount
                                            ) * 100,
                                        ),
                                    )}
                                <p class="shy-h4 b {
                                    ttdAccTsTerm >= 90 ?
                                        "yay" : (ttdAccTsTerm >= 80 ? "warn" : "ohno")
                                }" style="margin-top: 0px;">
                                    {ttdAccTsTerm}%
                                </p>
                                {:else}
                                <p class="fg0 shy-h4" style="margin-top: 0px;">N/A</p>
                                {/if}
                            </div>
                            <div>
                                <p class="fg0" style="margin-top: 0px; margin-bottom: 0px;">Def-to-Term:</p>
                                {#if term.progress.termCorrectCount +
                                    term.progress.termIncorrectCount > 0
                                }
                                    {const dttAccTsTerm = $derived(
                                        Math.floor(
                                            term.progress.termCorrectCount / (
                                                term.progress.termCorrectCount +
                                                term.progress.termIncorrectCount
                                            ) * 100,
                                        ),
                                    )}
                                <p class="shy-h4 b {
                                    dttAccTsTerm >= 90 ?
                                        "yay" : (dttAccTsTerm >= 80 ? "warn" : "ohno")
                                }" style="margin-top: 0px;">
                                    {dttAccTsTerm}%
                                </p>
                                {:else}
                                <p class="fg0 shy-h4" style="margin-top: 0px;">N/A</p>
                                {/if}
                            </div>
                        </div>
                        <div class="flex" style="justify-content: center;">
                            <a href={
                                /*
                                 *  NOTE: href="abc{def}" is NOT always the same as href={`abc${def}`}
                                 *  ampersands (`&`) MUST be escaped as `&amp;` in href="" (double quotes) (HTML syntax)
                                 *  do NOT escape ampersands in href={} (curly brackets) (JS syntax)
                                 */
                                `/term-stats?${term.id?.includes?.("-") ? "term" : "localTerm"}=${term.id}&${[
                                    ...data.cloudIds.map((id) => `studyset=${id}`),
                                    ...data.localIds.map((id) => `localStudyset=${id}`),
                                ].join("&")}`
                            } style="display: flex; flex-wrap: nowrap; align-items: center; gap: 0.4rem;">
                                <StatsIcon></StatsIcon>
                                <span style="margin-top: 0px;">View Details</span>
                            </a>
                        </div>
                        {/if}
                    </div>
                    {/if}
                {/each}
                {#if terms?.length > COLLAPSED_TERMS_COUNT}
                <button class="button-box" style="width: 100%; display: flex; align-items: center;" onclick={
                    () => showAllTerms = !showAllTerms
                }>
                    {#if showAllTerms}
                    <AngleUpIcon></AngleUpIcon> Collapse Terms
                    {:else}
                    <AngleDownIcon></AngleDownIcon> Show All Terms
                    {/if}
                </button>
                {/if}
            </div>
            <div class="practice-tests-chart-area">
        <div class="flex center">Practice Test Scores</div>
<div style="min-height: 300px;"> <!-- wrapper div to keep height while loading, to eliminate layout shift -->
<LineChart data={ptChartData} x="x" y="score" yDomain={[0, 1]} padding={defaultChartPadding({ right: 10 })} height={300} props={{
    yAxis: {
        format: (v) => v == 0 ? "" : `${Math.round(v*100)}%`
    },
    xAxis: {
        tickSpacing: 100,
        ticks: (s) => s.ticks?.().filter(Number.isInteger),
        format: (v) => fmtDateShort(ptChartData[v]?.date)
    }
}}>
    {#snippet marks({ context })}
		{#each context.series.visibleSeries as s (s.key)}
			<Spline seriesKey={s.key} style="stroke-width: 3px;" draw={{
                duration: 2000,
                easing: cubicOut
            }} curve={curveMonotoneX} />
		{/each}
	{/snippet}
    {#snippet tooltip({ context })}
        <Tooltip.Root {context}>
            {#snippet children({ data })}
                <Tooltip.Header value={data.date} format={fmtDate} />
                <Tooltip.List>
                    <Tooltip.Item label="score" value={data.score} format={(v) => `${Math.round(v*100)}%`} />
                </Tooltip.List>
            {/snippet}
        </Tooltip.Root>
    {/snippet}
</LineChart>
</div>
            </div>
            <div class="practice-tests-area">
                <div class="flex" style="align-items: end; justify-content: space-between;">
                    <p class="h4" style="margin-bottom: 0px;">Practice Tests</p>
                    <div class="flex">
                        {#if practiceTests?.length > 0 && practiceTestAvgScore != -1}
                            <span class={practiceTestAvgScore >= 90 ?
                                "yay" : (practiceTestAvgScore >= 80 ? "warn" : "ohno")
                            }>{practiceTestAvgScore}% average score</span>
                        {/if}
                        <span class="fg0">{practiceTests?.length ?? 0} total</span>
                    </div>
                </div>
                {#if practiceTests?.length > 0}
                    {#each practiceTests as practiceTest, index}
                        {#if index < COLLAPSED_PRACTICE_TESTS_COUNT || showAllPracticeTests}
                        <div class="box" transition:slide={{duration: 600}}>
                            <div class="grid gridfourpartthingrow">
                                {const tsPtScore = $derived(
                                    Math.floor((practiceTest.questionsCorrect / practiceTest.questionsTotal) * 100)
                                )}
                                <span class="b fourpartthing-one {
                                    tsPtScore >= 90 ?
                                        "yay" : (tsPtScore >= 80 ? "warn" : "ohno")
                                }">{tsPtScore}%</span>
                                <span class="fourpartthing-two">{practiceTest.questionsCorrect}/{practiceTest.questionsTotal}</span>
                                <span class="fourpartthing-three">{fancyTimestampReady ? fancyTimestamp.format(practiceTest.timestamp) : "..."}</span>
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
                    <button class="button-box" style="width: 100%; display: flex; align-items: center;" onclick={
                        () => showAllPracticeTests = !showAllPracticeTests
                    }>
                        {#if showAllPracticeTests}
                            <AngleUpIcon></AngleUpIcon> Collapse Practice Tests
                        {:else}
                            <AngleDownIcon></AngleDownIcon> Show All Practice Tests
                        {/if}
                    </button>
                    {/if}
                {:else}
                    <div class="box center text fg0">
                        (None)
                        <span class="line">Completed practice tests will show up here</span>
                    </div>
                {/if}
            </div>
        </div>
    </div>
</div>
