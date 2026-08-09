<script lang="ts">
	import { Axis, Bar, Chart, Highlight, Layer, Rule, Tooltip, defaultChartPadding } from 'layerchart';
	import { scaleBand } from 'd3-scale';
	import { cubicInOut } from 'svelte/easing';
    import { fancyTimestamp } from "$lib/fancyTimestamp";

const chartData = [
  {
    "date": new Date('2026-07-28T04:00:00.000Z'),
    "correct": 64,
    "incorrect": 92
  },
  {
    "date": new Date('2026-07-29T04:00:00.000Z'),
    "correct": 74,
    "incorrect": 49
  },
  {
    "date": new Date('2026-07-30T04:00:00.000Z'),
    "correct": 31,
    "incorrect": 76
  },
  {
    "date": new Date('2026-07-31T04:00:00.000Z'),
    "correct": 70,
    "incorrect": 88
  },
  {
    "date": new Date('2026-08-01T04:00:00.000Z'),
    "correct": 42,
    "incorrect": 71
  },
  {
    "date": new Date('2026-08-02T04:00:00.000Z'),
    "correct": 95,
    "incorrect": 26
  },
  {
    "date": new Date('2026-08-03T04:00:00.000Z'),
    "correct": 23,
    "incorrect": 86
  },
  {
    "date": new Date('2026-08-04T04:00:00.000Z'),
    "correct": 35,
    "incorrect": 58
  },
  {
    "date": new Date('2026-08-05T04:00:00.000Z'),
    "correct": 35,
    "incorrect": 71
  },
  {
    "date": new Date('2026-08-06T04:00:00.000Z'),
    "correct": 34,
    "incorrect": 48
  }
]
chartData.map((d) => {
    /* create date object from iso string */
    d.date = new Date(d.date);
    /* set to user time zone's 00:00 so layerchart shows correct dates */
    d.date.setHours(0, 0, 0, 0);
    return d;
});
</script>

<div class="grid page">
    <div class="content">
<Chart
	data={chartData}
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
			<Axis placement="bottom" rule />
				{#each chartData as d, i}
                    {const barWidth = $derived(Math.min(context.xScale.bandwidth?.() ?? 24, 24))}
                    <Bar
                    	data={d}
                        width={barWidth}
                    	y="correct"
                    	rounded="top"
                        radius={6}
                    	style="fill: var(--yay);"
                    	motion={{ type: 'tween', duration: 400, easing: cubicInOut, delay: i * 20 }}
                    	initialY={context.yScale(0)}
                    />
                    <Bar
                    	data={d}
                        width={barWidth}
                    	y={(d) => -d.incorrect}
                    	rounded="bottom"
                        radius={6}
                    	style="fill: var(--ohno);"
                    	motion={{ type: 'tween', duration: 400, easing: cubicInOut, delay: i * 20 }}
                    	initialY={context.yScale(0)}
                    />
				{/each}
			<Rule y={0} />
			<Highlight area />
		</Layer>

		<Tooltip.Root>
			{#snippet children({ data })}
				<Tooltip.Header value={data.date} format={(v) => fancyTimestamp.format(v)} />
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
