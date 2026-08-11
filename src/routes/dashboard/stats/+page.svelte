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

    let totalTermsReviewed = $state("");
    let totalTermsCount = 0;
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
</script>

<svelte:head>
  <title>Quizfreely</title>
</svelte:head>

<Noscript />

<p><span style="font-size: 1.2rem;">{totalTermsReviewed}</span> terms reviewed/questions answered
<span class="line fg0">in the last year</span></p>
<div style="width: 100%; aspect-ratio: 31/5;">
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

e

