<script>
    import StudysetLinkBox from "$lib/components/StudysetLinkBox.svelte";
    import Noscript from "$lib/components/Noscript.svelte";
    import Searchbar from "$lib/components/Searchbar.svelte";
    import ArrowLeftIcon from "$lib/icons/ArrowLeft.svelte";
    import ArrowRightIcon from "$lib/icons/ArrowRight.svelte";

    let { data } = $props();
</script>

<svelte:head>
    {#if data.query}
        <title>Search "{data.query}" - Quizfreely</title>
        <meta name="”robots”" content="noindex" />
    {:else}
        <title>Search Quizfreely</title>
        <meta
            name="description"
            content="Quizfreely is a free and open source learning app with flashcards, practice tests, and more tools to help you study."
        />
    {/if}
</svelte:head>

<main>
    <div class="grid page">
        <div class="content">
            {#if data.query?.length >= 1}
                <p>Results for "{data.query}"</p>
                {#if data?.results?.length > 0}
                    <div class="grid list" style="overflow-wrap:anywhere">
                        {#each data.results as studyset}
                            <StudysetLinkBox
                                {studyset}
                                linkTemplateFunc={(id) => `/studysets/${id}`}
                            ></StudysetLinkBox>
                        {/each}
                    </div>
                    <div
                        class={data.pageInfo?.hasNextPage &&
                        data.pageInfo?.hasPreviousPage
                            ? "combo-buttons"
                            : ""}
                    >
                        {#if data.pageInfo?.hasPreviousPage}
                            <a
                                href="/search?q={data.query}&before={data
                                    .pageInfo.startCursor}"
                                class="button alt {data.pageInfo?.hasNextPage
                                    ? 'left'
                                    : ''}"
                            >
                                <ArrowLeftIcon></ArrowLeftIcon> Previous
                            </a>
                        {/if}
                        {#if data.pageInfo?.hasNextPage}
                            <a
                                href="/search?q={data.query}&after={data
                                    .pageInfo.endCursor}"
                                class="button alt {data.pageInfo
                                    ?.hasPreviousPage
                                    ? 'right'
                                    : ''}"
                            >
                                Next <ArrowRightIcon></ArrowRightIcon>
                            </a>
                        {/if}
                    </div>
                {:else}
                    <div class="box">
                        <p class="fg0">No results</p>
                    </div>
                {/if}
            {:else}
                <h2 style="text-align:center;margin-top:4rem;margin-bottom:0px">
                    Quizfreely
                </h2>
                <Searchbar />
                <div style="margin-bottom:20rem"></div>
            {/if}
        </div>
    </div>
</main>
