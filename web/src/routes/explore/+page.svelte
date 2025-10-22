<script>
    import { onMount } from "svelte";
    import Searchbar from "$lib/components/Searchbar.svelte";
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
                <h2 style="text-align:center;margin-top:4rem;margin-bottom:0px">Quizfreely</h2>
                <div class="flex center">
                    <div style="width: 100%; max-width: 40rem;">
                        <Searchbar />
                    </div>
                </div>
            <div class="grid list" style="margin-top: 4rem;">
                <a class="button button-box" href="/categories/math">
                    Math
                </a>
                <a class="button button-box" href="/categories/languages">
                    World Languages
                </a>
                <a class="button button-box" href="/categories/stem">
                    STEM
                </a>
                <a class="button button-box" href="/categories/social-studies">
                    Social Studies
                </a>
                <a class="button button-box" href="/categories/la">
                    Language Arts
                </a>
            </div>
            <p style="margin-top: 6rem;">All Subjects:</p>
            <div class="grid list">
                {#each data?.allSubjects as subject}
                    <span>
                        <a href="/subjects/{subject.id}">
                            {subject.name}
                        </a>
                    </span>
                {/each}
            </div>
        </div>
    </div>
</main>
