<script>
    import { onMount } from "svelte";
    import StudysetLinkBox from "$lib/components/StudysetLinkBox.svelte";
    import CheckmarkIcon from "$lib/icons/Checkmark.svelte";
    import ArrowLeftIcon from "$lib/icons/ArrowLeft.svelte";
    import ArrowRightIcon from "$lib/icons/ArrowRight.svelte";
    let { data } = $props();

    const theList = $derived(
        data.recentlyUpdated
            ? data.recentlyUpdatedStudysets
            : data.recentlyCreatedStudysets,
    );

    let modPowersActive = $state(false);
    onMount(() => {
        if (data.authedUser?.modPerms) {
            modPowersActive =
                localStorage.getItem("quizfreely:modPowersActive") == "true";
        }
    });

    const numFmt = new Intl.NumberFormat('en-US', {
        /* we don't know the user's locale when we're in SSR,
        using `undefined` instead of specifying 'en-US' would use the environment default,
        but that would be en-US on the server and then whatever the user's locale is in the client,
        which would result in mismatching UI if you load the page initially (with SSR) or navigate to it afterwords client-side,
        so for now, we just use en-US, since for numbers it's already pretty international-friendly
        (with 'compact' & 'short', it gives us numbers like 123K, 1.2M, etc) */
        notation: 'compact',
        compactDisplay: 'short'
    });
</script>

<svelte:head>
    <title>Recent Studysets | Quizfreely</title>
    <meta
        name="description"
        content="Quizfreely is a free and open source learning app with flashcards, practice tests, and more tools to help you study."
    />
    <meta name="robots" content="index, follow" />
</svelte:head>

<div class="flex center">
    <div class="flex" style="flex-direction: column; gap: 0.2rem;">
        <span style="font-size: 2rem;">{numFmt.format(data.dailyCount)}</span>
        <div class="text fg0">
            studyset{data.dailyCount === 1 ? "" : "s"}
            {data.recentlyUpdated ? "updated" : "created"}
            <span class="line">last 24 hours</span>
        </div>
    </div>
    <div class="flex" style="flex-direction: column; gap: 0.2rem;">
        <span style="font-size: 2rem;">{numFmt.format(data.monthlyCount)}</span>
        <div class="text fg0">
            studyset{data.monthlyCount === 1 ? "" : "s"}
            {data.recentlyUpdated ? "updated" : "created"}
            <span class="line">last 30 days</span>
        </div>
    </div>
    <div class="flex" style="flex-direction: column; gap: 0.2rem;">
        <span style="font-size: 2rem;">{numFmt.format(data.totalCount)}</span>
        <div class="text fg0">
            total studyset{data.totalCount === 1 ? "" : "s"}
        </div>
    </div>
</div>

<div class="grid list">
    {#each theList as studyset}
        <StudysetLinkBox
            {studyset}
            linkTemplateFunc={(id) => `/studysets/${id}`}
            showDropdown={false}
        ></StudysetLinkBox>
    {/each}
</div>
<div
    class={data.pageInfo?.hasNextPage && data.pageInfo?.hasPreviousPage
        ? "combo-buttons"
        : ""}
>
    {#if data.pageInfo?.hasPreviousPage}
        <a
            href="/explore/recent?before={data.pageInfo
                .startCursor}{data.recentlyUpdated ? '&updated' : ''}"
            class="button alt {data.pageInfo?.hasNextPage ? 'left' : ''}"
        >
            <ArrowLeftIcon></ArrowLeftIcon> Previous
        </a>
    {/if}
    {#if data.pageInfo?.hasNextPage}
        <a
            href="/explore/recent?after={data.pageInfo
                .endCursor}{data.recentlyUpdated ? '&updated' : ''}"
            class="button alt {data.pageInfo?.hasPreviousPage ? 'right' : ''}"
        >
            Next <ArrowRightIcon></ArrowRightIcon>
        </a>
    {/if}
</div>
