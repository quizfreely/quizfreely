<script lang="ts">
	import { LineChart, Chart, defaultChartPadding, Spline } from 'layerchart';
    import { curveMonotoneX } from "d3-shape";

const data = [
  {
    "date": new Date('2026-07-08T04:00:00.000Z'),
    "value": 83
  },
  {
    "date": new Date('2026-07-09T04:00:00.000Z'),
    "value": 60
  },
  {
    "date": new Date('2026-07-10T04:00:00.000Z'),
    "value": 56
  },
  {
    "date": new Date('2026-07-11T04:00:00.000Z'),
    "value": 84
  },
  {
    "date": new Date('2026-07-12T04:00:00.000Z'),
    "value": 86
  },
  {
    "date": new Date('2026-07-13T04:00:00.000Z'),
    "value": 56
  },
  {
    "date": new Date('2026-07-14T04:00:00.000Z'),
    "value": 63
  },
  {
    "date": new Date('2026-07-15T04:00:00.000Z'),
    "value": 55
  },
  {
    "date": new Date('2026-07-16T04:00:00.000Z'),
    "value": 60
  },
  {
    "date": new Date('2026-07-17T04:00:00.000Z'),
    "value": 62
  },
  {
    "date": new Date('2026-07-18T04:00:00.000Z'),
    "value": 67
  },
  {
    "date": new Date('2026-07-19T04:00:00.000Z'),
    "value": 61
  },
  {
    "date": new Date('2026-07-20T04:00:00.000Z'),
    "value": 59
  },
  {
    "date": new Date('2026-07-21T04:00:00.000Z'),
    "value": 97
  },
  {
    "date": new Date('2026-07-22T04:00:00.000Z'),
    "value": 84
  },
  {
    "date": new Date('2026-07-23T04:00:00.000Z'),
    "value": 82
  },
  {
    "date": new Date('2026-07-24T04:00:00.000Z'),
    "value": 81
  },
  {
    "date": new Date('2026-07-25T04:00:00.000Z'),
    "value": 78
  },
  {
    "date": new Date('2026-07-26T04:00:00.000Z'),
    "value": 87
  },
  {
    "date": new Date('2026-07-27T04:00:00.000Z'),
    "value": 56
  },
  {
    "date": new Date('2026-07-28T04:00:00.000Z'),
    "value": 75
  },
  {
    "date": new Date('2026-07-29T04:00:00.000Z'),
    "value": 87
  },
  {
    "date": new Date('2026-07-30T04:00:00.000Z'),
    "value": 95,
  },
  {
    "date": new Date('2026-07-31T04:00:00.000Z'),
    "value": 97
  },
  {
    "date": new Date('2026-08-01T04:00:00.000Z'),
    "value": 65,
  },
  {
    "date": new Date('2026-08-02T04:00:00.000Z'),
    "value": 87,
  },
  {
    "date": new Date('2026-08-03T04:00:00.000Z'),
    "value": 51,
  },
  // {
  //   "date": new Date('2026-08-04T04:00:00.000Z'),
  //   "value": 93
  // },
  // {
  //   "date": new Date('2026-08-05T04:00:00.000Z'),
  //   "value": 0
  // },
  // {
  //   "date": new Date('2026-08-06T04:00:00.000Z'),
  //   "value": 73
  // }
]
</script>

<div class="grid page">
    <div class="content">
        <div class="flex center">Practice Test Scores</div>
<LineChart {data} x="date" y="value" padding={defaultChartPadding({ right: 10 })} height={300}>
    {#snippet marks({ context })}
		{#each context.series.visibleSeries as s (s.key)}
			<Spline seriesKey={s.key} style="stroke-width: 3px;" draw curve={curveMonotoneX} />
		{/each}
	{/snippet}
</LineChart>
    </div>
</div>

