<script>
	import { scaleThreshold } from "d3-scale";
    import { quantile } from "d3-array";
    import { onMount } from "svelte"
    import { idbApiLayer } from "$lib/idb-api-layer/index.js";
	import { Calendar, Chart, Layer, Rect, Tooltip } from "layerchart";
    import StudysetLinkBox from "$lib/components/StudysetLinkBox.svelte";
    import Noscript from "$lib/components/Noscript.svelte";
    import AngleUpIcon from "$lib/icons/AngleUp.svelte";
    import AngleDownIcon from "$lib/icons/AngleDown.svelte";
    let { data } = $props();

	const now = new Date();
    const start365DaysAgo = new Date(now);
    start365DaysAgo.setDate(now.getDate() - 365);
    start365DaysAgo.setHours(0, 0, 0, 0);

    let chartData = $state([]);
    let domain = $state([
        10,
        25,
        50
    ]);
    let activityHistory = $state(data.activityHistory ?? []);

    let totalTermsReviewed = $state("0");
    let totalTermsCount = 0;
    function calcChart(reviewEventStatsByDay) {
        if (reviewEventStatsByDay?.length > 0) {
            totalTermsCount = 0;
            chartData = reviewEventStatsByDay.map((obj) => {
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

            const sortedValues = chartData
                .map(d => d.terms)
                .filter((v) => v > 0)
                .sort((a, b) => a - b)
            const refMax = quantile(sortedValues, 0.95) ?? 1;
            domain = [
                refMax * 0.25,
                refMax * 0.5,
                refMax * 0.75
            ];
        }
    }
    if (data.authed) {
        calcChart(data.reviewEventStatsByDay);
    }

    let recentCurrentlyCollapsed = $state(true);
    const COLLAPSE_LENGTH_S = 3;
    let myRecentActivityStudysets = $state(data.myRecentActivityStudysets?.edges?.map((e) => e.node) ?? [])
    async function cloudStudysetsByIds(cloudUuids) {
        try {
            const raw = await fetch("/api/graphql", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    query: `query ($ids: [ID!]!) {
                        studysets(ids: $ids) {
                            id title private termsCount updatedAt
                            myFolder { id name }
                        }
                    }`,
                    variables: { ids: cloudUuids }
                })
            });
            const resp = await raw.json();
            return cloudUuids.map((_, i) => resp?.data?.studysets?.[i] ?? null);
        } catch {
            return cloudUuids.map(() => null);
        }
    }
    onMount(async () => {
        if (!data.myRecentActivityStudysets || data.myRecentActivityStudysets.length === 0) {
            try {
                const result = await idbApiLayer.getRecentActivityStudysets({
                    getCloudStudysets: cloudStudysetsByIds
                });
                if (result?.length > 0) {
                    myRecentActivityStudysets = result;
                }
            } catch (err) {
                console.error("Error loading recent activity studysets from local IDB:", err);
            }
        }
        if (!data.authed) {
            const reviewStats = await idbApiLayer.getReviewEventStatsByDay({ last: 366 });
            calcChart(reviewStats);
            const localActivityHistory = await idbApiLayer.activityHistory({
                last: 40,
                getCloudStudysets: cloudStudysetsByIds
            });
            // console.log("localActivityHistory:", localActivityHistory);
            if (localActivityHistory == null) {
                console.error("idbApiLayer.activityHistory returned nullish")
            } else {
                localActivityHistory.forEach(item => {
                    if (item.timestamp != null) {
                        item.__typename = "PracticeTest";
                    } else if (item.endTimestamp != null) {
                        item.__typename = "MatchActivity";
                    }
                });
                activityHistory = localActivityHistory;
            }
        }
    });
    function recentLinkFunc(id) {
        if (typeof id === 'number') {
            return `/studyset/local?id=${id}`;
        }
        return `/studysets/${id}`;
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
:global {
    .qzfr-pt-box,
    .qzfr-match-box {
        display: grid;
        gap: 0.4rem 0.6rem;
        grid-template-rows: auto;
        grid-template-columns: 1fr 1fr 1fr;
        grid-template-areas: "type score count";
        padding: 0.8rem;
    }
    .qzfr-pt-box .qzfrbox-type,
    .qzfr-match-box .qzfrbox-type {
        grid-area: type;
    }
    .qzfr-pt-box .qzfrbox-score,
    .qzfr-match-box .qzfrbox-score {
        grid-area: score;
    }
    .qzfr-pt-box .qzfrbox-count,
    .qzfr-match-box .qzfrbox-count {
        grid-area: count;
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
        .qzfr-pt-box,
        .qzfr-match-box {
            grid-template-rows: auto auto;
            grid-template-columns: 1fr 1fr;
            grid-template-areas:
                "type type"
                "score count";
        }
    }
}
</style>

<svelte:head>
  <title>History &amp; Stats | Quizfreely</title>
</svelte:head>

<Noscript />

<p><span style="font-size: 1.2rem;">{totalTermsReviewed}</span> terms/questions reviewed
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
				<Tooltip.Header value={data.date} format={fmtDate} />

					<Tooltip.List>
						<Tooltip.Item label="terms" value={data.terms ?? 0} format="integer" valueAlign="right" />
					</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
</div>
                <p class="h4" style="font-size: 1.4rem; opacity: 0.9; margin-top: 2rem;">Recent Studysets</p>
                {#if myRecentActivityStudysets?.length > 0}
                <div
                    class="grid list"
                    style="overflow-wrap: anywhere; {
                    myRecentActivityStudysets?.length > COLLAPSE_LENGTH_S
                        ? 'margin-bottom: 0px;'
                        : ''}"
                >
                    {#each recentCurrentlyCollapsed ? myRecentActivityStudysets.slice(0, COLLAPSE_LENGTH_S) : myRecentActivityStudysets as studyset}
                        <StudysetLinkBox
                            {studyset}
                            linkTemplateFunc={recentLinkFunc}
                            showDropdown={false}
                        ></StudysetLinkBox>
                    {/each}
                </div>
                {:else}
                    <div class="box center text fg0">
                        (None)
                    </div>
                {/if}
                {#if myRecentActivityStudysets?.length > COLLAPSE_LENGTH_S}
                    <div
                        class="flex center"
                        style="width: 100%; margin-top: 0.6rem; flex-direction: column; align-items: center; gap: 0.8rem;"
                    >
                        <button
                            class="faint"
                            onclick={() => {
                                recentCurrentlyCollapsed =
                                    !recentCurrentlyCollapsed;
                            }}
                        >
                            {#if recentCurrentlyCollapsed}
                                <AngleDownIcon></AngleDownIcon> Show All
                            {:else}
                                <AngleUpIcon></AngleUpIcon> Collapse
                            {/if}
                        </button>
                    </div>
                {/if}
<p class="h4" style="font-size: 1.4rem; opacity: 0.9; margin-top: 1rem;">Recent Activities</p>
{#each activityHistory as item, index}
    <!-- {JSON.stringify(item)} -->
    {#if item?.studysets?.[0] == null}
        <div class="flex" style="align-items: end; justify-content: start; {index != 0 ? "margin-top: 1.6rem;" : ""}">
            <span class="fg0" style="font-size: 1.2rem;">Deleted Studyset</span>
        </div>
    {:else if index - 1 < 0 || activityHistory[index - 1].studysets[0]?.id != item.studysets[0].id}
        {const studyset = $derived(item.studysets[0])}
        <div class="flex" style="align-items: end; justify-content: space-between; row-gap: 0.2rem; {index != 0 ? "margin-top: 1.6rem;" : ""}">
            <span style={studyset.title.length < 60 ? "font-size: 1.2rem;" : ""}>{studyset.title}</span>
            <a href={studyset.id?.includes?.("-") ? `/studysets/${studyset.id}` : `/studyset/local?id=${studyset.id}`}>View Studyset</a>
        </div>
    {/if}
    {#if item.__typename == "PracticeTest"}
        <div class="box grid qzfr-pt-box">
            <span class="qzfrbox-type fg0">Practice Test</span>
            {const score = $derived(Math.round(item.questionsCorrect/item.questionsTotal*100))}
            <span class="qzfrbox-score {score >= 90 ? "yay" : (score >= 80 ? "warn" : "ohno")}">{score}%</span>
            <span class="qzfrbox-count {score >= 90 ? "yay" : (score >= 80 ? "warn" : "ohno")}">{item.questionsCorrect}/{item.questionsTotal}</span>
        </div>
    {:else if item.__typename == "MatchActivity"}
        <div class="box grid qzfr-match-box">
            <span class="qzfrbox-type fg0">Match</span>
            <span class="qzfrbox-score">{(item.durationMs/1000).toFixed(1)}s</span>
            <span class="qzfrbox-count {item.incorrectPairIds.length > 0 ? "ohno" : "yay"}">{item.incorrectPairIds.length} incorrect</span>
        </div>
    {/if}
{:else}
    <div class="box center text fg0">
        (None)
    </div>
{/each}

