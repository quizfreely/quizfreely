<script>
    let { data } = $props();
    import QuizfreelyLogo from "$lib/svg/QuizfreelyLogo.svelte";
    import NewFeature from "$lib/changelog/v2.0.0.svelte";
    import SparklesIcon from "$lib/icons/Sparkles.svelte";
    import HeartIcon from "$lib/icons/Heart.svelte";
    import IconCodeberg from "$lib/icons/Codeberg.svelte";
    import IconGitHub from "$lib/icons/GitHub.svelte";
    import NoIcon from "$lib/icons/No.svelte";
    import CheckmarkIcon from "$lib/icons/Checkmark.svelte";
    import InfinityIcon from "$lib/icons/Infinity.svelte";

    /* we don't know the user's locale when we're in SSR,
    using `undefined` instead of specifying 'en-US' would use the environment default,
    but that would be en-US on the server and then whatever the user's locale is in the client,
    which would result in mismatching UI if you load the page initially (with SSR) or navigate to it afterwords client-side,
    so for now, we just use en-US, since for numbers it's already pretty international-friendly
    (with 'compact' & 'short', it gives us numbers like 123K, 1.2M, etc) */
    const numFmt = new Intl.NumberFormat("en-US");
</script>

<svelte:head>
    <title>Quizfreely: Free Open-Source Studying Tool</title>
    <meta name="description" content="Quizfreely is a free and open-source learning app with flashcards, practice tests, and more tools to help you study." />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="https://quizfreely.org" />
</svelte:head>

<div class="grid intro" style="margin-bottom: 0px; padding-bottom: 0px; border:none">
    <div class="logotype">
        <div class="logo">
            <QuizfreelyLogo></QuizfreelyLogo>
        </div>
        <div>
            <p class="h3">Quizfreely</p>
        </div>
    </div>
    <div class="content">
        <h1 class="h2" style="max-width: 36rem; margin: auto">
            A studying tool that's <span class="extra">actually free</span>
        </h1>
        <p style="max-width: 28rem; margin: auto; margin-top: 1rem">
            Quizfreely is a free and open-source learning app with flashcards, practice tests, and !
        </p>
        <div class="flex center">
            <a href="/sign-up" class="button large">Get Started</a>
            <a href="/explore" class="button large alt">Explore</a>
        </div>
    </div>
</div>
<div class="wave-top extra-bg"></div>
<div class="grid page extra">
    <div class="content">
        <div class="grid list grid-list-but-different">
            <div class="box" style="display: flex; gap: 0.4rem; align-items: center;">
                <InfinityIcon></InfinityIcon> Unlimited Free Practice Tests
            </div>
            <div class="box" style="display: flex; gap: 0.4rem; align-items: center;">
                <NoIcon></NoIcon> No Ads
            </div>
            <div class="box" style="display: flex; gap: 0.4rem; align-items: center;">
                <CheckmarkIcon></CheckmarkIcon> Free and Open-Source
            </div>
            <div class="box" style="display: flex; gap: 0.4rem; align-items: center;">
                <NoIcon></NoIcon> No Paid Subscriptions
            </div>
        </div>
        <div style="margin-top: 3rem;">
            <h2 class="h3">It's <span class="extra">actually free</span></h2>
            <p style="max-width: 40rem;">
                Quizfreely has unlimited practice tests for free, unlike other flashcard websites or studying apps. Quizfreely is open-source and non-profit, and there are no ads and no paid features or subscriptions.
            </p>
        </div>
        <div style="margin-top: 4rem;">
            <h2 class="h3" style="max-width: 40rem;"><span class="extra">Advanced features</span> to measure &amp; improve your studying habits</h2>
            <p style="max-width: 40rem;">
                Quizfreely records individual terms' &amp; flashcards' progress &amp; accuracy. It calculates frequently confused terms or definitions and finds which incorrect answer choices are selected the most. Quizfreely gives users deep, detailed, insights on their learning.
            </p>
        </div>
    </div>
</div>
<div class="wave-bottom extra-bg" style="margin-bottom: 0px;"></div>
<div class="grid page" style="margin-top: 0px;">
    <div class="content">
        <div class="flex center">
            <h2 class="h4 center" style="opacity: 0.9; max-width: 30rem;">Thousands of free resources made by other students and teachers</h2>
        </div>
        <div class="flex center" style="gap: 2rem;">
            <div class="flex" style="flex-direction: column; gap: 0.2rem;">
                <span style="font-size: 2.2rem;">{numFmt.format(data.totalCount)}</span>
                <div class="text fg0">
                    studyset{data.totalCount === 1 ? "" : "s"}
                </div>
            </div>
            <div class="flex" style="flex-direction: column; gap: 0.2rem;">
                <span style="font-size: 2.2rem;">{numFmt.format(data.totalTermCount)}</span>
                <div class="text fg0">
                    term{data.totalTermCount === 1 ? "" : "s"}
                </div>
            </div>
        </div>
    </div>
</div>
<div class="wave-top extra-bg" style="margin-top: 0px;"></div>
<div class="grid page extra" style="padding-bottom: 0px;">
    <div class="content">
        <div>
            <h2 class="h3">Quizfreely is <span class="love">non-profit</span></h2>
            <p>
                Quizfreely is a non-profit project with <a href="https://hcb.hackclub.com/quizfreely" class="link-love with-underline">transparent finances</a>.
                <span class="optional-line-600px">We're fiscally sponsored by <a class="link-love with-underline" href="https://the.hackfoundation.org">The Hack Foundation</a>, a <span style="white-space: nowrap;">501(c)(3)</span> nonprofit.</span>
            </p>
            <div class="flex">
                <a class="button large alt love qzfr-love-alt" href="https://hcb.hackclub.com/donations/start/quizfreely">
                    <HeartIcon></HeartIcon>
                    Donate
                </a>
            </div>
        </div>
        <div style="margin-top: 3rem;">
            <h2 class="h3">Fully <span class="love">open-source</span></h2>
            <p style="max-width: 36rem;">
                Quizfreely is released under the AGPL-3.0 license. The frontend web app, backend API, <a href="https://docs.quizfreely.org" class="link-love with-underline">documentation</a>, and all of Quizfreely's software is open-source on Codeberg and GitHub.
            </p>
            <div class="flex compact-gap">
                <a class="button large faint" href="https://codeberg.org/quizfreely/quizfreely">
                    <IconCodeberg></IconCodeberg>
                    Codeberg
                </a>
                <a class="button large faint" href="https://github.com/quizfreely/quizfreely">
                    <IconGitHub></IconGitHub>
                    GitHub
                </a>
            </div>
        </div>
    </div>
</div>
<div class="wave-bottom extra-bg" style="margin-bottom: 0px;"></div>
<div class="grid page" style="margin-top: 0px;">
    <div class="content">
        <h2 class="h4">Constantly updated with new features</h2>
        <div class="flex" style="align-items: center; gap: 0.2rem;">
            <SparklesIcon class="text fg0" width="1.2rem" height="1.2rem" />
            <p class="fg0">New Features</p>
        </div>
        <div class="flex">
            <NewFeature boxStyle="padding-right: 3rem;" />
        </div>
    </div>
</div>

<style>
    .grid-list-but-different,
    .grid.list.grid-list-but-different {
        grid-template-columns: 1fr 1fr 1fr 1fr;
    }
    @media only screen and (max-width: 1500px) {
        .grid-list-but-different,
        .grid.list.grid-list-but-different {
            grid-template-columns: 1fr 1fr;
        }
    }
    @media only screen and (max-width: 800px) {
        .grid-list-but-different,
        .grid.list.grid-list-but-different {
            grid-template-columns: 1fr;
        }
    }
</style>
