<script>
    import { onMount } from "svelte";
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
            <div class="grid list" style="margin-top: 2rem;">
                <a class="button button-box aligndiffwhensmol" href="/categories/languages">
                    World Languages
                </a>
                <a class="button button-box aligndiffwhensmol" href="/categories/social-studies">
                    Social Studies
                </a>
                <a class="button button-box aligndiffwhensmol" href="/categories/stem">
                    STEM
                </a>
                <a class="button button-box aligndiffwhensmol" href="/categories/math">
                    Math
                </a>
                <a class="button button-box aligndiffwhensmol" href="/categories/language-arts">
                    Language Arts
                </a>
            </div>
            <p class="fg0" style="margin-top: 4rem;">All Subjects</p>
            <div class="grid list">
                {#each data?.allSubjects as subject}
                    <a class="button button-box" style="text-align: start;" href="/subjects/{subject.id}">
                        {subject.name}
                    </a>
                {/each}
            </div>
        </div>
    </div>
</main>
