<script>
	import { scaleThreshold } from 'd3-scale';
    import { quantile } from 'd3-array';
	import { Calendar, Chart, Layer, Rect, Tooltip } from 'layerchart';
    import Noscript from "$lib/components/Noscript.svelte";
    let { data } = $props();

	const now = new Date();
    const start365DaysAgo = new Date(now);
    start365DaysAgo.setDate(now.getDate() - 365);
    start365DaysAgo.setHours(0, 0, 0, 0);

    const FALLBACK_P25 = 10;
    const FALLBACK_P50 = 25;
    const FALLBACK_P75 = 50;
    let chartData = $state([]);
    let domain = $state([
        FALLBACK_P25,
        FALLBACK_P50,
        FALLBACK_P75
    ]);
    let activityHistory = $state(data.activityHistory ?? []);

    let totalTermsReviewed = $state("");
    let totalTermsCount = 0;
    function calcChart() {
        if (data?.reviewEventStatsByDay?.length > 0) {
            chartData = data.reviewEventStatsByDay.map((obj) => {
                const d = { ...obj };
                d.date = new Date(d.timestamp);
                d.date.setHours(0, 0, 0, 0);
                d.terms = d.correct + d.incorrect;
                totalTermsCount += d.terms;
                if (d?.terms == 0) {
                    d.terms = null;
                }
                return d;
            });
            totalTermsReviewed = totalTermsCount.toLocaleString();
            const sortedValues = data.reviewEventStatsByDay
                .map(d => d.value)
                .filter((v) => v > 0)
                .sort((a,b) => a - b);
            const p25 = quantile(sortedValues, 0.25) ?? FALLBACK_P25;
            const p50 = quantile(sortedValues, 0.5) ?? FALLBACK_P50;
            const p75 = quantile(sortedValues, 0.75) ?? FALLBACK_P75;
            domain = [p25, p50, p75];
        }
    }
    if (data.authed) {
        calcChart();
    }
</script>
<style>
:global {
    .qzfr-pt-box {
        display: grid;
        gap-column: 0.6rem;
        gap-row: 0.2rem;
        grid-template-rows: auto;
        grid-template-columns: 1fr 1fr 1fr;
    }
    .qzfr-match-box {
        display: grid;
        gap-column: 0.6rem;
        gap-row: 0.2rem;
        grid-template-rows: auto;
        grid-template-columns: 1fr 1fr 1fr;
    }
    .qzfr-eh-lc-div {
        width: 100%;
        aspect-ratio: 31/5;
    }
    @media only screen and (max-width: 1000px) {
        .qzfr-eh-lc-div {
            aspect-ratio: 31/6;
        }
    }
    @media only screen and (max-width: 500px) {
        .qzfr-eh-lc-div {
            aspect-ratio: 31/7;
        }
    }
    .qzfr-eh-lc-chart ::selection {
        color: var(--fg-1);
        fill: var(--fg-1);
    }
}
</style>

<svelte:head>
  <title>Quizfreely</title>
</svelte:head>

<Noscript />

<p><span style="font-size: 1.2rem;">{totalTermsReviewed}</span> terms reviewed/questions answered
<span class="line fg0">in the last year</span></p>
<div class="qzfr-eh-lc-div">
<Chart
	data={chartData}
	x="date"
	c="terms"
	cScale={scaleThreshold()}
	cDomain={domain}
	cRange={[
		'color-mix(in srgb, var(--yay) 25%, transparent)',
		'color-mix(in srgb, var(--yay) 50%, transparent)',
		'color-mix(in srgb, var(--yay) 75%, transparent)',
		'var(--yay)'
	]}
	padding={{ top: 20 }}
    class="qzfr-eh-lc-chart"
>
	{#snippet children({ context })}
		<Layer>
			<Calendar start={start365DaysAgo} end={now}>
				{#snippet children({ cells, cellSize })}
					{#each cells as cell}
						{@const padding = 1}
						<Rect
							x={cell.x + padding}
							y={cell.y + padding}
							width={cellSize[0] - padding * 2}
							height={cellSize[1] - padding * 2}
							rx={6}
							fill={cell.color ?? 'var(--bg-3)'}
							onpointermove={(e) => context.tooltip?.show(e, cell.data)}
							onpointerleave={(e) => context.tooltip?.hide()}
						/>
					{/each}
				{/snippet}
			</Calendar>
		</Layer>

		<Tooltip.Root>
			{#snippet children({ data })}
				<Tooltip.Header value={data.date} format="day" />

					<Tooltip.List>
						<Tooltip.Item label="terms" value={data.terms ?? 0} format="integer" valueAlign="right" />
					</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
</div>

<h2 class="h4" style="margin-top: 2rem;">Recent Activities</h2>
{#each activityHistory as item, index}
    <!-- {JSON.stringify(item)} -->
    {#if item?.studysets?.[0] != null && (index - 1 < 0 || activityHistory[index - 1].studysets[0].id != item.studysets[0].id)}
        {const studyset = $derived(item.studysets[0])}
        <div class="flex" style="align-items: center; justify-content: space-between; row-gap: 0.2rem;">
            <span>{studyset.title}</span>
            <a href={studyset.id.includes("-") ? `/studysets/${studyset.id}` : `/studyset/local?id=${studyset.id}`}>View Studyset</a>
        </div>
    {/if}
    {#if item.__typename == "PracticeTest"}
        <div class="box grid qzfr-pt-box">
            <span class="fg0">Practice Test</span>
            {const score = $derived(Math.round(item.questionsCorrect/item.questionsTotal*100))}
            <span class={score >= 90 ? "yay" : "ohno"}>{score}%</span>
            <span class={score >= 90 ? "yay" : "ohno"}>{item.questionsCorrect}/{item.questionsTotal}</span>
        </div>
    {:else if item.__typename == "MatchActivity"}
        <div class="box grid qzfr-match-box">
            <span class="fg0">Match</span>
            <span>{(item.durationMs/1000).toFixed(1)}s</span>
            <span class={item.incorrectPairIds.length > 0 ? "ohno" : "yay"}>{item.incorrectPairIds.length} incorrect</span>
        </div>
    {/if}
{:else}
    <div class="box center text fg0">
        No activities to show
    </div>
{/each}

