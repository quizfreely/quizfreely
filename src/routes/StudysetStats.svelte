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
    let { data } = $props();

    const REVIEW_EVENT_STATS_DAYS = 30;
    let terms = $state(
        data?.local ?
            [] : data?.studyset?.terms
    );
    let practiceTests = $state(
        data?.local ?
            [] : data?.studyset?.practiceTests ?? []
    );
    let reviewEventStats = $state(
        data?.local ?
            [] : data?.studyset?.reviewEventStatsByDay ?? []
    );
    let termsStats = $derived.by(() => {
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
    let practiceTestAvgScore = $derived.by(() => {
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

    let mounted = $state(false);
    let ptChartData = $state([]);
    let reChartData = $state([]);
    onMount(() => {
        let objectUrls = [];
        (async () => {
            mounted = true;
            if (data?.settingsDateTimeFmtHours == "24") {
                fancyTimestamp.hours = 24;
            } else if (data?.settingsDateTimeFmtHours == "12") {
                fancyTimestamp.hours = 12;
            }

            if (data.local) {
                /* studyset is local, so regardless of wheater the user is logged in or not,
                we load the studyset and progress locally */
                const studyset = await idbApiLayer.getStudysetById(data.localId, {
                    terms: {
                        progress: true,
                        termImageUrl: true,
                        defImageUrl: true
                    },
                    practiceTests: true,
                    reviewEventStatsByDay: REVIEW_EVENT_STATS_DAYS
                })
                terms = studyset.terms;
                terms.forEach(term => {
                    if (term.termImageUrl != null) {
                        objectUrls.push(term.termImageUrl);
                    }
                    if (term.defImageUrl != null) {
                        objectUrls.push(term.defImageUrl);
                    }
                })
                practiceTests = studyset?.practiceTests ?? [];
                reviewEventStats = studyset?.reviewEventStatsByDay ?? [];
            }

            if (!data.authed && !data.local) {
                /* not logged in, so user data is local,
                but studyset is a cloud studyset,
                so we need to map local progress to cloud terms

                `terms` has already been populated during SSR (above, before onMount) */
                practiceTests = await db.practiceTests.where("studysetIds").equals(data.studysetId).toArray();
                practiceTests?.sort(
                    /* timestamps are ISO strings in UTC,
                    so lexical/alphanumeric sorting is the same as chronological sorting
                    also you see we're comparing `b` to `a`, so its descending,
                    so most recent is first */
                    (a, b) => b.timestamp.localeCompare(a.timestamp)
                );
                practiceTests = practiceTests ?? [];

                const termIds = terms.map(t => t.id);
                reviewEventStats = await idbApiLayer.getReviewEventStatsByDay({
                    last: REVIEW_EVENT_STATS_DAYS,
                    termIds: termIds
                });

                for (const term of terms) {
                    term.progress = (await db.termProgress.where("termId").equals(term.id).toArray())?.[0];
                }
            }

            if (practiceTests != null) {
                ptChartData = practiceTests.filter(
                    pt => pt.questionsTotal > 0
                ).map(pt => ({
                    date: new Date(pt.timestamp),
                    score: pt.questionsCorrect / pt.questionsTotal
                })).reverse(); /* reverse gives us correct order for layerchart draw animation */
            }

            reChartData = reviewEventStats.map((d) => ({
                ...d,
                /* create date object from iso string */
                date: new Date(d.timestamp),
            }));
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
			<Axis placement="left" grid rule format={(d) => Math.abs(d)} />
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
                    	motion={{ type: 'tween', duration: 400, easing: backOut, delay: i * 20 }}
                    	initialY={context.yScale(0)}
                    />
                    <Bar
                    	data={d}
                        width={barWidth}
                    	y={(d) => -d.incorrect}
                    	rounded="bottom"
                        radius={8}
                    	style="fill: var(--ohno);"
                    	motion={{ type: 'tween', duration: 400, easing: backOut, delay: i * 20 }}
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
                                "yay" : "ohno"
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
                                <p class="fg0 shy-h4" style="margin-top: 0px;">N/A</p>
                                {/if}
                            </div>
                            <div>
                                <p class="fg0" style="margin-top: 0px; margin-bottom: 0px;">Definition Accuracy:</p>
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
                            <!-- <a href="{ -->
                            <!--     data.local ? -->
                            <!--         `/studyset/local/stats/term?id=${term.id}&studysetId=${data?.localId}` : -->
                            <!--         `/studysets/${data.studysetId}/stats/terms/${term.id}` -->
                            <!-- }" style="display: flex; flex-wrap: nowrap; align-items: center; gap: 0.4rem;"> -->
                            <!--     <StatsIcon></StatsIcon> -->
                            <!--     <span style="margin-top: 0px;">View Details</span> -->
                            <!-- </a> -->
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
<LineChart data={ptChartData} x="date" y="score" yDomain={[0, 1]} padding={defaultChartPadding({ right: 10 })} height={300} props={{
    yAxis: {
        format: (v) => `${Math.round(v*100)}%`
    },
    xAxis: {
        tickSpacing: 100,
        format: fmtDateShort
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
                                "yay" : "ohno"
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
