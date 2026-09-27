<script>
    import { onMount } from "svelte";
    import NewFeature from "$lib/components/features/v2.0.0.svelte";
    import SparklesIcon from "$lib/icons/Sparkles.svelte";
    let { data } = $props();
    let modPowersActive = $state(false);
    onMount(() => {
        if (data.authedUser?.modPerms) {
            modPowersActive = (localStorage.getItem("quizfreely:modPowersActive") == "true");
        }
    })

    const numFmt = new Intl.NumberFormat('en-US', {
        /* we don't know the user's locale when we're in SSR,
        using `undefined` instead of specifying 'en-US' would use the environment default,
        but that would be en-US on the server and then whatever the user's locale is in the client,
        which would result in mismatching UI if you load the page initially (with SSR) or navigate to it afterwords client-side,
        so for now, we just use en-US, since for numbers it's already pretty international-friendly
        (with 'compact' & 'short', it gives us numbers like 123K, 1.2M, etc) */
        notation: 'compact',
        compactDisplay: 'short'
    });
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
    .new-feature-container {
        max-width: 40rem;
        margin-top: 0.6rem;
    }
    @media only screen and (max-width: 1000px) {
        .new-feature-container {
            max-width: 100%;
        }
    }
</style>

<svelte:head>
    <title>Explore &amp; Search | Quizfreely</title>
    <meta name="description" content="Quizfreely is a free and open source learning app with flashcards, practice tests, and more tools to help you study." />
    <meta name="robots" content="index, follow" />
</svelte:head>

<div class="flex center">
    <div class="flex" style="flex-direction: column; gap: 0.2rem;">
        <span style="font-size: 2rem;">{numFmt.format(data.dailyCount)}</span>
        <div class="text fg0">
            studyset{data.dailyCount === 1 ? "" : "s"}
            {data.recentlyUpdated ? "updated" : "created"}
            <span class="line">last 24 hours</span>
        </div>
    </div>
    <div class="flex" style="flex-direction: column; gap: 0.2rem;">
        <span style="font-size: 2rem;">{numFmt.format(data.monthlyCount)}</span>
        <div class="text fg0">
            studyset{data.monthlyCount === 1 ? "" : "s"}
            {data.recentlyUpdated ? "updated" : "created"}
            <span class="line">last 30 days</span>
        </div>
    </div>
    <div class="flex" style="flex-direction: column; gap: 0.2rem;">
        <span style="font-size: 2rem;">{numFmt.format(data.totalCount)}</span>
        <div class="text fg0">
            total studyset{data.totalCount === 1 ? "" : "s"}
        </div>
    </div>
</div>
        <div class="flex" style="align-items: center; gap: 0.2rem;">
            <SparklesIcon class="text fg0" width="1.2rem" height="1.2rem" />
            <p class="fg0">New Features</p>
        </div>
        <div class="new-feature-container">
            <NewFeature />
        </div>
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
            <p class="fg0" style="margin-top: 2rem;">All Subjects</p>
            <div class="grid list">
                {#each data?.allSubjects as subject}
                    <a class="button button-box" style="text-align: start;" href="/subjects/{subject.id}">
                        {subject.name}
                    </a>
                {/each}
            </div>
