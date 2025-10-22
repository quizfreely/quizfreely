<script>
    import { onMount } from "svelte";
    import MathIcon from "$lib/icons/Math.svelte";
    let { data } = $props();
    let modPowersActive = $state(false);
    onMount(() => {
        if (data.authedUser?.modPerms) {
            modPowersActive = (localStorage.getItem("quizfreely:modPowersActive") == "true");
        }
    })
</script>

<svelte:head>
    <title>Explore & Search - Quizfreely</title>
    <meta name="description" content="Quizfreely is a free and open source learning app with flashcards, practice tests, and more tools to help you study." />
    <meta name=”robots” content="index, follow" />
</svelte:head>

<main>
    <div class="grid page">
        <div class="content">
            <div class="grid list">
                <a class="button button-box">
                    Math
                </a>
                <a class="button button-box">
                    World Languages
                </a>
                <a class="button button-box">
                    STEM
                </a>
                <a class="button button-box">
                    Social Studies
                </a>
                <a class="button button-box">
                    Language Arts
                </a>
            </div>
        </div>
    </div>
</main>
