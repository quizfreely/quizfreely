<script>
	import { scaleBand } from 'd3-scale';
	import { Axis, Bar, Chart, Layer, Tooltip, Highlight } from 'layerchart';
	import { backOut } from 'svelte/easing';

    const chartDataSrc = $state([
        {
            id: "23e",
            title: "Englisch Unit 4 und 5",
            accuracy: 1,
        },
        {
            id: "dfs290",
            title: "Psychology Ch1",
            accuracy: 0.2,
        },
        {
            id: "1b3e",
            title: "Untitled Studyset",
            accuracy: 1,
        },
        {
            id: "1b33e",
            title: "Wordly Wise 3000 Level 8, Lesson 15",
            accuracy: 0.8,
        },
        {
            id: "1b33e",
            title: "Wordly Wise 3000 Level 8, Lesson 8",
            accuracy: 0.8,
        },
        {
            id: "1b33e",
            title: "body cavities and serous membranes",
            accuracy: 0.8,
        },
        {
            id: "1b33e",
            title: "anatomical planes and sections",
            accuracy: 0.8,
        },
        {
            id: "1b33e",
            title: "CAM V@ FInancial Terms and Formulas",
            accuracy: 0.8,
        },
    ]);
    const chartData = $derived.by(() => {
        const newChartData = [];
        /* loop to clone array with new objects because we can't reference the same reactive objects */
        chartDataSrc.forEach(d => {
            newChartData.push({
                id: d.id,
                title: d.title,
                accuracy: d.accuracy,
                titleShort: d.title?.length > 30 ? `${d.title?.slice(0, 30)}...` : d.title,
            });
        });
        newChartData.sort((a, b) => b.accuracy - a.accuracy);
        /* loop again after sorting because index is updated */
        newChartData.forEach((d, index) => {
            d.index = index;
        });
        return newChartData;
    });
</script>
<style>
.grid.qzfr-combined-studyset-stats-grid {
    gap: 1rem;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto;
}
</style>

<div class="grid page">
    <div class="content">
{const height = $derived.by(() => {
    const v = 200 + 50*(chartData.length - 2);
    console.log(v);
    return v;
})}
<div class="grid qzfr-combined-studyset-stats-grid">
<div style="min-height: {height}px;">
<Chart
	data={chartData}
	y="index"
	yScale={scaleBand().padding(0.6)}
	x="accuracy"
	xDomain={[0, null]}
	xNice
	padding={{ left: 100, top: 10, bottom: 20, right: 20 }}
	height={height}
	tooltipContext={{ mode: 'band' }}
>
	<Layer>
		<Axis placement="left" rule format={(index) => chartData[index].titleShort}/>
		<Axis placement="bottom" grid rule format={(v) => `${Math.round(v*100)}%`} />
        {#each chartData as d, i}
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
                fill={d.accuracy >= 0.9 ? "var(--yay)" : (d.accuracy >= 0.8 ? "var(--warn)" : "var(--ohno)")}
            />
        {/each}
		<Highlight area />
	</Layer>
		<Tooltip.Root>
			{#snippet children({ data })}
				<Tooltip.Header value={data.title} format="string" />
				<Tooltip.List>
					<Tooltip.Item
						label="Accuracy"
						value={data.accuracy}
                        format={(v) => `${Math.round(v*100)}%`}
					/>
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
</Chart>
</div>
            <div class="box flex" style="flex-direction: column;">
                {#each chartData as d}
                    <span>{d.title}</span>
                {/each}
            </div>
</div>
        <div class="box">
Next box
            </div>
</div>
</div>
