<script>
    import StudysetLinkBox from "$lib/components/StudysetLinkBox.svelte";
    import ArrowLeftIcon from "$lib/icons/ArrowLeft.svelte";
    import ArrowRightIcon from "$lib/icons/ArrowRight.svelte";

    let { data } = $props();
</script>

<svelte:head>
    <title>{data.user.displayName} - Quizfreely</title>
</svelte:head>

<div
    class="flex center"
    style="flex-direction: column; gap: 0.5rem; margin-bottom: 2rem;"
>
    <h1 style="margin: 0;">{data.user.displayName}</h1>
    {#if data.user.username}
        <h2
            class="fg0"
            style="margin: 0; font-weight: normal; font-size: 1.2rem;"
        >
            @{data.user.username}
        </h2>
    {/if}
</div>

<div class="grid list">
    {#each data.studysets as studyset}
        <StudysetLinkBox
            {studyset}
            linkTemplateFunc={(id) => `/studysets/${id}`}
            showDropdown={false}
        ></StudysetLinkBox>
    {/each}
    {#if data.studysets?.length == 0}
        <div class="box text fg0 center">
            This user has no public studysets.
        </div>
    {/if}
</div>

<div
    class={data.pageInfo?.hasNextPage && data.pageInfo?.hasPreviousPage
        ? "combo-buttons"
        : ""}
    style="margin-top: 2rem;"
>
    {#if data.pageInfo?.hasPreviousPage}
        <a
            href="?before={data.pageInfo.startCursor}"
            class="button alt {data.pageInfo?.hasNextPage ? 'left' : ''}"
        >
            <ArrowLeftIcon></ArrowLeftIcon> Previous
        </a>
    {/if}
    {#if data.pageInfo?.hasNextPage}
        <a
            href="?after={data.pageInfo.endCursor}"
            class="button alt {data.pageInfo?.hasPreviousPage ? 'right' : ''}"
        >
            Next <ArrowRightIcon></ArrowRightIcon>
        </a>
    {/if}
</div>
