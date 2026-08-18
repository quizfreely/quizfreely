<script>
    import { onMount } from "svelte";
    import { idbApiLayer, db } from "$lib/idb-api-layer";
    import averageAccuracy from "$lib/average-accuracy.js";
	import { Axis, Bar, Chart, Highlight, Layer, Rule, Tooltip, defaultChartPadding } from 'layerchart';
	import { scaleBand } from 'd3-scale';
	import { backOut } from 'svelte/easing';
    import { fancyTimestamp } from "$lib/fancyTimestamp";
    import BackIcon from "$lib/icons/BackArrow.svelte"
    import ForwardLongArrowIcon from "$lib/icons/ForwardRightArrowLong.svelte"
    import StatsIcon from "$lib/icons/ChartGraphLine.svelte"
    import { slide } from "svelte/transition";
    let { data } = $props();
    let term = $state();
    let objectUrls = [];

    if (!data.local) {
        term = data?.term;
    }

    let reChartData = $state([]);

    if (!data.local && data.authed) {
        calcChart(data?.term?.reviewEventStatsByDay ?? []);
    }
    let mounted = $state(false);
    onMount(() => {
        (async () => {
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
                    termImageUrl: true,
                    defImageUrl: true
                })
                if (term.termImageUrl != null) {
                    objectUrls.push(term.termImageUrl);
                }
                if (term.defImageUrl != null) {
                    objectUrls.push(term.defImageUrl);
                }
            }

            if (!data.authed && !data.local) {
                /* not logged in, so user data is local,
                but studyset is a cloud studyset,
                so we need to map local progress to cloud terms

                `term` has already been populated during SSR (above, before onMount) */
                term.progress = (await db.termProgress.where("termId").equals(term.id).toArray())?.[0];
            }

            if (data.local || !data.authed) {
                term.reviewEventStatsByDay = await idbApiLayer.getReviewEventStatsByDay({
                    termIds: [term.id]
                });
                calcChart(term.reviewEventStatsByDay);
            }
        })();
        return () => {
            objectUrls.forEach(objectUrl => {
                URL.revokeObjectURL(objectUrl);
            });
        }
    })

    function calcChart(stats) {
        reChartData = stats.map((d) => ({
            ...d,
            /* create date object from iso string */
            date: new Date(d.timestamp),
        }));
    }

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
    .chart-container {
        position: relative;
        width: 100%;
        max-width: 100%;
        height: 16rem;
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
    .term-image {
        max-width: 300px;
        max-height: 200px;
        margin: 0px;
        padding: 0px;
        border-radius: 0.8rem;
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
        <div class="grid twogridthings" style="margin-top: 2rem;">
            <div>
                <p class="fg0">Term</p>
                <p class="shy-h3" style="margin-top: 0px;">{term?.term}</p>
                {#if term?.termImageUrl != null}
                    <div><img src={term.termImageUrl} alt="term image" class="term-image"></div>
                {/if}
            </div>
            <div>
                <p class="fg0">Definition</p>
                <p class="shy-h3" style="margin-top: 0px;">{term?.def}</p>
                {#if term?.defImageUrl != null}
                    <div><img src={term.defImageUrl} alt="definition image" class="term-image"></div>
                {/if}
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
                        ) >= 90 ?
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
                    <p class="fg0" style="margin-top: 0px; margin-bottom: 0px;">Term-to-Def Accuracy:</p>
                    {#if term.progress.defCorrectCount +
                        term.progress.defIncorrectCount > 0
                    }
                        <p class="shy-h4 b {
                            term.progress.defCorrectCount / (
                                term.progress.defCorrectCount +
                                term.progress.defIncorrectCount
                            ) >= 0.9 ?
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
                <div>
                    <p class="fg0" style="margin-top: 0px; margin-bottom: 0px;">Def-to-Term Accuracy:</p>
                    {#if term.progress.termCorrectCount +
                        term.progress.termIncorrectCount > 0
                    }
                        <p class="shy-h4 b {
                            term.progress.termCorrectCount / (
                                term.progress.termCorrectCount +
                                term.progress.termIncorrectCount
                            ) >= 0.9 ?
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
            <!-- <p class="h4" style="margin-top: 2rem;">Frequently Confused Terms</p> -->
            <!-- <p class="fg0">These terms are frequently selected incorrect answers.</p> -->
            <!-- <div> -->
            <!--     {#each topConfusionPairsUniqueArray as confusionPair } -->
            <!--         <div class="box"> -->
            <!--             {confusionPair?.confusedTerm?.term} -->
            <!--         </div> -->
            <!--     {:else} -->
            <!--         <div class="box center text fg0"> -->
            <!--             (None) -->
            <!--         </div> -->
            <!--     {/each} -->
            <!-- </div> -->
            <!-- <p class="h4" style="margin-top: 2rem;">Reverse-Confused Terms</p> -->
            <!-- <p class="fg0">This term is a frequently selected incorrect answer for these terms.</p> -->
            <!-- <div> -->
            <!--     {#each topReverseConfusionPairsUniqueArray as confusionPair } -->
            <!--         <div class="box"> -->
            <!--             {confusionPair?.term?.term} -->
            <!--         </div> -->
            <!--     {:else} -->
            <!--         <div class="box center text fg0"> -->
            <!--             (None) -->
            <!--         </div> -->
            <!--     {/each} -->
            <!-- </div> -->
        {/if}
    </div>
</div>
