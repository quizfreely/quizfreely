<script>
    import StudysetLinkBox from "$lib/components/StudysetLinkBox.svelte";
    import ArrowLeftIcon from "$lib/icons/ArrowLeft.svelte";
    import ArrowRightIcon from "$lib/icons/ArrowRight.svelte";
    import UserIcon from "$lib/icons/User.svelte";

    let { data } = $props();
    console.log(data);
</script>

<svelte:head>
    <title>{data.user.displayName} - Quizfreely</title>
    <meta name="robots" content="noindex, follow" />
</svelte:head>

<div class="grid page">
    <div class="content">
        <div
            class="flex"
            style="flex-direction: row; justify-content: space-between; align-items: center;"
        >
            <div class="flex" style="margin-top: 1rem;">
                <UserIcon width="2rem" height="2rem" style="margin-top: 0.4rem;"
                ></UserIcon>
                <div
                    class="flex"
                    style="flex-direction: column; gap: 0.2rem; margin-bottom: 0px;"
                >
                    <h1 style="font-size: 2rem; margin-bottom: 0px;">
                        {data.user.displayName}
                    </h1>
                    {#if data.user.username}
                        <p class="text fg0" style="font-size: 1.2rem;">
                            @{data.user.username}
                        </p>
                    {/if}
                </div>
            </div>
            <div>
                {#if data?.user?.id == data?.authedUser?.id}
                    <div class="flex">
                        <a href="/settings/account" class="button alt">
                            Account Settings
                        </a>
                    </div>
                {/if}
            </div>
        </div>

        {#if data?.studysetCount > 0}
            <p class="fg0" style="text-align: end;">
                {data?.studysetCount} public studysets
            </p>
        {/if}
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
                    class="button alt {data.pageInfo?.hasNextPage
                        ? 'left'
                        : ''}"
                >
                    <ArrowLeftIcon></ArrowLeftIcon> Previous
                </a>
            {/if}
            {#if data.pageInfo?.hasNextPage}
                <a
                    href="?after={data.pageInfo.endCursor}"
                    class="button alt {data.pageInfo?.hasPreviousPage
                        ? 'right'
                        : ''}"
                >
                    Next <ArrowRightIcon></ArrowRightIcon>
                </a>
            {/if}
        </div>
    </div>
</div>
