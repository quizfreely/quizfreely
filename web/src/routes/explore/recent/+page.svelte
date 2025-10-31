<script>
    import { onMount } from "svelte";
    import StudysetLinkBox from "$lib/components/StudysetLinkBox.svelte";
    import CheckmarkIcon from "$lib/icons/Checkmark.svelte";
    import ArrowRightIcon from "$lib/icons/ArrowRight.svelte";
    let { data } = $props();

    const theList = $derived(data.recentlyUpdated ? data.recentlyUpdatedStudysets : data.recentlyCreatedStudysets);
    const pageNums = $derived(Array.from({length: data.pageNum}, (_, i) => i + 1));

    let modPowersActive = $state(false);
    onMount(() => {
        if (data.authedUser?.modPerms) {
            modPowersActive = (localStorage.getItem("quizfreely:modPowersActive") == "true");
        }
    })
</script>
<style>
    .aligndiffwhensmol {
        text-align: center;
    }
    @media only screen and (max-width: 800px) {
        .aligndiffwhensmol {
            text-align: start;
        }
    }
</style>

<svelte:head>
    <title>Explore & Search - Quizfreely</title>
    <meta name="description" content="Quizfreely is a free and open source learning app with flashcards, practice tests, and more tools to help you study." />
    <meta name=”robots” content="index, follow" />
</svelte:head>

<main>
    <div class="grid page">
        <div class="content">
            <div class="flex">
                <a class="button button-box {!data.recentlyUpdated ? "selected" : ""}" href="/explore/recent">
                    <CheckmarkIcon class="button-box-selected-icon"></CheckmarkIcon>
                    Recently Created
                </a>
                <a class="button button-box {data.recentlyUpdated ? "selected" : ""}" href="/explore/recent?updated">
                    <CheckmarkIcon class="button-box-selected-icon"></CheckmarkIcon>
                    Recently Updated
                </a>
            </div>
            <div class="grid list">
                {#each theList as studyset}
                    <StudysetLinkBox
                        {studyset}
                        linkTemplateFunc={id => `/studysets/${id}`}
                        showDropdown={false}
                    ></StudysetLinkBox>
                {/each}
            </div>
            <div class="combo-select">
                {#each pageNums as n}
                    <a href="/explore/recent?page={n}{ data.recentlyUpdated ? "&updated" : "" }" class="button {n == 1 ? "left" : (n == theList?.length - 1 && !(theList?.length >= data.PER_PAGE) ? "right" : "mid")} {n == data.pageNum ? "selected" : ""}">
                        {n}
                    </a>
                {/each}
                {#if theList?.length >= data.PER_PAGE}
                    <a href="/explore/recent?page={data.pageNum - (-1)}" class="button right">
                        Next <ArrowRightIcon></ArrowRightIcon>
                    </a>
                {/if}
            </div>
        </div>
    </div>
</main>
