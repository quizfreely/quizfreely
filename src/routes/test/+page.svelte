<script lang="ts">
	import { scaleThreshold } from 'd3-scale';
    import { quantile } from 'd3-array';
	import { Calendar, Chart, Layer, Rect, Tooltip } from 'layerchart';

	const now = new Date();
    const start365DaysAgo = new Date(now);
    start365DaysAgo.setDate(now.getDate() - 365);
    start365DaysAgo.setHours(0, 0, 0, 0);

    const data = [
  {
    "date": new Date('2022-08-11T04:00:00.000Z'),
    "value": 0
  },
  {
    "date": new Date('2026-02-16T05:00:00.000Z'),
    "value": 88
  },
  {
    "date": new Date('2025-02-17T05:00:00.000Z'),
    "value": 67
  },
  {
    "date": new Date('2025-02-18T05:00:00.000Z'),
    "value": 78
  },
  {
    "date": new Date('2025-02-19T05:00:00.000Z'),
    "value": 26
  },
  {
    "date": new Date('2025-02-20T05:00:00.000Z'),
    "value": 66
  },
  {
    "date": new Date('2026-08-04T04:00:00.000Z'),
    "value": 15
  },
  {
    "date": new Date('2026-08-05T04:00:00.000Z'),
    "value": 0
  },
  {
    "date": new Date('2026-08-06T04:00:00.000Z'),
    "value": 0
  },
  {
    "date": new Date('2026-08-07T04:00:00.000Z'),
    "value": 92
  },
  {
    "date": new Date('2026-08-08T04:00:00.000Z'),
    "value": 25
  },
  {
    "date": new Date('2026-08-09T04:00:00.000Z'),
    "value": 0
  }
]
data.forEach((d) => {
    d.date = new Date(d.date);
    d.date.setHours(0, 0, 0, 0);
    if (d?.value == 0) {
        d.value = null;
    } else {
        d.value = d.value
    }
});
    
    const sortedValues = data.map(d => d.value).filter(
        (v) => v > 0
    ).sort((a,b) => a - b);
    const p25 = quantile(sortedValues, 0.25) ?? 10;
    const p50 = quantile(sortedValues, 0.5) ?? 25;
    const p75 = quantile(sortedValues, 0.75) ?? 50
    const domain = [p25, p50, p75];
</script>

<Chart
	data={data}
	x="date"
	c="value"
	cScale={scaleThreshold()}
	cDomain={domain}
	cRange={[
		'color-mix(in srgb, var(--yay) 25%, transparent)',
		'color-mix(in srgb, var(--yay) 50%, transparent)',
		'color-mix(in srgb, var(--yay) 75%, transparent)',
		'var(--yay)'
	]}
	padding={{ top: 20 }}
	height={140}
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
							rx={4}
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
						<Tooltip.Item label="value" value={data.value ?? 0} format="integer" valueAlign="right" />
					</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
