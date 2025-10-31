<script>
    import { onMount } from "svelte";
    import CheckmarkIcon from "$lib/icons/Checkmark.svelte";
    let { data } = $props();
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
                <a class="button button-box" href="/explore/recent?page={data?.pageNum}">
                    <CheckmarkIcon class="button-box-selected-icon"></CheckmarkIcon>
                    Recently Created
                </a>
                <a class="button button-box" href="/explore/recent?updated&page={data?.pageNum}">
                    <CheckmarkIcon class="button-box-selected-icon"></CheckmarkIcon>
                    Recently Updated
                </a>
            </div>
            <div class="grid list">
            </div>
        </div>
    </div>
</main>
