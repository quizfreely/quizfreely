<script>
	import { scaleBand } from 'd3-scale';
	import { Axis, Bar, Chart, Layer, Tooltip } from 'layerchart';
	import { backOut } from 'svelte/easing';

    const chartDataSrc = $state([
        {
            id: "23e",
            title: "abc title",
            accuracy: 1,
        },
        {
            id: "dfs290",
            title: "title goes here",
            accuracy: 0.2,
        },
        {
            id: "1b3e",
            title: "ABCD TITLE!",
            accuracy: 1,
        },
        {
            id: "1b33e",
            title: "ABCDEF TITLE!",
            accuracy: 1,
        },
    ]);
    const chartData = $derived.by(() => {
        const newChartData = [];
        chartDataSrc.forEach((d, index) => {
            newChartData.push({
                ...d,
                index
            });
        });
        return newChartData;
    });
</script>

<div class="grid page">
    <div class="content">
<Chart
	data={chartData}
	y="index"
	yScale={scaleBand().padding(0.6)}
	x="accuracy"
	xDomain={[0, null]}
	xNice
	padding={{ left: 24, bottom: 20, top: 8 }}
	height={300}
	tooltipContext={{ mode: 'band' }}
>
	<Layer>
		<Axis placement="left" rule format={(index) => chartData[index].title} />
		<Axis placement="bottom" grid rule />
        {#each chartData as d, i}
            <Bar
                data={d}
                rounded="right"
                radius={8}
                motion={{
                    type: 'tween',
                    duration: 400,
                    easing: backOut,
                    delay: i * 60
                }}
                fill={d.accuracy >= 0.9 ? "var(--yay)" : (d.accuracy >= 0.8 ? "var(--warn)" : "var(--ohno)")}
            />
        {/each}
	</Layer>
		<Tooltip.Root>
			{#snippet children({ data })}
				<Tooltip.Header value={data.title} format="string" />
				<Tooltip.List>
					<Tooltip.Item
						label="accuracy"
						value={data.accuracy}
					/>
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
</Chart>
</div>
</div>
