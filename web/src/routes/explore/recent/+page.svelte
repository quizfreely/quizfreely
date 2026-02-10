<script>
    import { onMount } from "svelte";
    import StudysetLinkBox from "$lib/components/StudysetLinkBox.svelte";
    import CheckmarkIcon from "$lib/icons/Checkmark.svelte";
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

<main>
    <div class="grid page">
        <div class="content">
            <div class="flex">
                <a
                    class="button button-box {!data.recentlyUpdated
                        ? 'selected'
                        : ''}"
                    href="/explore/recent"
                >
                    <CheckmarkIcon class="button-box-selected-icon"
                    ></CheckmarkIcon>
                    Recently Created
                </a>
                <a
                    class="button button-box {data.recentlyUpdated
                        ? 'selected'
                        : ''}"
                    href="/explore/recent?updated"
                >
                    <CheckmarkIcon class="button-box-selected-icon"
                    ></CheckmarkIcon>
                    Recently Updated
                </a>
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
            <div class="combo-select">
                {#if data.pageInfo?.hasPreviousPage}
                    <a
                        href="/explore/recent?before={data.pageInfo
                            .startCursor}{data.recentlyUpdated
                            ? '&updated'
                            : ''}"
                        class="button {data.pageInfo?.hasNextPage
                            ? 'left'
                            : 'right'}"
                    >
                        <ArrowRightIcon style="transform: rotate(180deg)"
                        ></ArrowRightIcon> Previous
                    </a>
                {/if}
                {#if data.pageInfo?.hasNextPage}
                    <a
                        href="/explore/recent?after={data.pageInfo
                            .endCursor}{data.recentlyUpdated ? '&updated' : ''}"
                        class="button {data.pageInfo?.hasPreviousPage
                            ? 'right'
                            : 'right'}"
                    >
                        Next <ArrowRightIcon></ArrowRightIcon>
                    </a>
                {/if}
            </div>
        </div>
    </div>
</main>

<style>
</style>
