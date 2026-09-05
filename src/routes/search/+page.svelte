<script>
    import { studysetSelection } from "$lib/studyset-selection.svelte.js";
    import { onMount } from "svelte";
    import StudysetLinkBox from "$lib/components/StudysetLinkBox.svelte";
    import Noscript from "$lib/components/Noscript.svelte";
    import Searchbar from "$lib/components/Searchbar.svelte";
    import ArrowLeftIcon from "$lib/icons/ArrowLeft.svelte";
    import ArrowRightIcon from "$lib/icons/ArrowRight.svelte";
    import OutlineIcon from "$lib/icons/OutlineSelect.svelte";
    import XMarkIcon from "$lib/icons/CloseXMark.svelte";

    let { data } = $props();
    let selectingMultiple = $state(false);
    const selectionCancelButtonCallback = () => {
        selectingMultiple = false;
    }
    studysetSelection.setCancelButtonCallback(selectionCancelButtonCallback);
    onMount(() => {
        return () => {
            studysetSelection.cleanUpCancelButtonCallback(selectionCancelButtonCallback);
        };
    });
</script>

<svelte:head>
    {#if data.query}
        <title>Search "{data.query}" | Quizfreely</title>
        <meta name="robots" content="noindex" />
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
                <div class="flex" style="justify-content: space-between;">
                    <div class="flex">
                    </div>
                    <button onclick={() => selectingMultiple = !selectingMultiple} class="alt {selectingMultiple ? "text fg1" : ""}">
                        {#if selectingMultiple}
                            <XMarkIcon />
                            Stop Selecting
                        {:else}
                            <OutlineIcon></OutlineIcon>
                            Select Multiple
                        {/if}
                    </button>
                </div>
                {#if data?.results?.length > 0}
                    <div class="grid list" style="overflow-wrap:anywhere">
                        {#each data.results as studyset}
                            <StudysetLinkBox
                                {studyset}
                                linkTemplateFunc={(id) => `/studysets/${id}`}
                                button={selectingMultiple}
                                buttonOnClick={(_event, studyset) => {
                                    studysetSelection.toggleSelect(
                                        studyset.id?.includes?.("-") ? {
                                            cloudId: studyset.id,
                                        } : {
                                            localId: studyset.id,
                                        },
                                    );
                                }}
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
                                href="/search?q={data.query}&amp;before={data
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
                                href="/search?q={data.query}&amp;after={data
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
