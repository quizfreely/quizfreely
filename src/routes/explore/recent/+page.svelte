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
</script>

<svelte:head>
    <title>Explore & Search - Quizfreely</title>
    <meta
        name="description"
        content="Quizfreely is a free and open source learning app with flashcards, practice tests, and more tools to help you study."
    />
    <meta name="”robots”" content="index, follow" />
</svelte:head>

<div class="flex center">
    <div class="flex" style="flex-direction: column; gap: 0.2rem;">
        <span style="font-size: 2rem;">{data.newCount}</span>
        <div class="text fg0">
            studyset{data.newCount === 1 ? "" : "s"}
            {data.recentlyUpdated ? "updated" : "created"}
            <span class="line">{data.newPeriod}</span>
        </div>
    </div>
    <div class="flex" style="flex-direction: column; gap: 0.2rem;">
        <span style="font-size: 2rem;">{data.totalCount}</span>
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
