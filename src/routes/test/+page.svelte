<script lang="ts">
	import { Axis, Bar, Chart, Highlight, Layer, Rule, Tooltip, defaultChartPadding } from 'layerchart';
	import { scaleBand } from 'd3-scale';
	import { cubicInOut } from 'svelte/easing';

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
</script>

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
                    <Bar
                    	data={d}
                    	y="correct"
                    	rounded="top"
                    	strokeWidth={1}
                    	style="fill: var(--yay);"
                    	motion={{ type: 'tween', duration: 600, easing: cubicInOut, delay: i * 40 }}
                    	initialY={context.yScale(0)}
                    />
                    <Bar
                    	data={d}
                    	y={(d) => -d.incorrect}
                    	rounded="bottom"
                    	strokeWidth={1}
                    	style="fill: var(--ohno);"
                    	motion={{ type: 'tween', duration: 600, easing: cubicInOut, delay: i * 40 }}
                    	initialY={context.yScale(0)}
                    />
				{/each}
			<Rule y={0} />
			<Highlight area />
		</Layer>

		<Tooltip.Root pointerEvents>
			{#snippet children({ data })}
				<Tooltip.Header value={data.date} format="day" />
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
