<script>
    let { data } = $props();
    import QuizfreelyLogo from "$lib/svg/QuizfreelyLogo.svelte";
    import HeartIcon from "$lib/icons/Heart.svelte";
    import IconCodeberg from "$lib/icons/Codeberg.svelte";
    import IconGitHub from "$lib/icons/GitHub.svelte";
    import NoIcon from "$lib/icons/No.svelte";
    import CheckmarkIcon from "$lib/icons/Checkmark.svelte";
    import InfinityIcon from "$lib/icons/Infinity.svelte";
</script>

<svelte:head>
    <title>Quizfreely: Free Open Source Studying Tool</title>
    <meta name="description" content="Quizfreely is a free and open source learning app with flashcards, practice tests, and more tools to help you study." />
    <meta name=”robots” content="index, follow" />
    <link rel="canonical" href="https://quizfreely.org" />
</svelte:head>

<main>
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
            Quizfreely is a free and open source learning app with flashcards, review/learn mode, practice tests, & more!
        </p>
        <div class="flex center">
            <a href="/sign-up" class="button large">Get Started</a>
            <a href="/explore" class="button large alt">Explore</a>
        </div>
    </div>
</div>
<div class="grid page">
    <div class="content">
    </div>
</div>
  <div class="wave-top extra-bg"></div>
  <div class="grid page extra">
    <div class="content">
        <div class="grid list grid-list-but-different">
            <div class="box" style="display: flex; gap: 0.4rem; align-items: center;">
                <NoIcon></NoIcon> No Ads
            </div>
            <div class="box" style="display: flex; gap: 0.4rem; align-items: center;">
                <InfinityIcon></InfinityIcon> Unlimited Free Practice Tests
            </div>
            <div class="box" style="display: flex; gap: 0.4rem; align-items: center;">
                <CheckmarkIcon></CheckmarkIcon> Advanced Features
            </div>
            <div class="box" style="display: flex; gap: 0.4rem; align-items: center;">
                <NoIcon></NoIcon> No Paid Subscriptions
            </div>
            <div class="box" style="display: flex; gap: 0.4rem; align-items: center;">
                <CheckmarkIcon></CheckmarkIcon> Free & Open Source
            </div>
            <div class="box" style="display: flex; gap: 0.4rem; align-items: center;">
                <CheckmarkIcon></CheckmarkIcon> Privacy-Friendly
            </div>
        </div>
      <div style="margin-top: 4rem;">
          <h2 class="h3">It's <span class="extra">actually free</span></h2>
          <p style="max-width: 40rem;">
              Quizfreely has unlimited practice tests for free, unlike other flashcard websites or studying apps. Quizfreely is open source and nonprofit, and there are no ads and no paid features or subscriptions.
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
  <div class="wave-bottom extra-bg"></div>
  <div class="grid page">
    <div class="content">
      <div>
        <h2 class="h3">Quizfreely is <span class="love">nonprofit</span></h2>
        <p>
            Quizfreely is a nonprofit project with <a href="https://hcb.hackclub.com/quizfreely" class="link-love with-underline">transparent finances</a>.
            <span class="optional-line-600px">We're fiscally sponsored by <a class="link-love with-underline" href="https://the.hackfoundation.org">The Hack Foundation</a>, a <span style="white-space: nowrap;">501(c)(3)</span> nonprofit.</span>
        </p>
        <div class="flex">
          <a class="button large love" href="https://hcb.hackclub.com/donations/start/quizfreely">
            <HeartIcon></HeartIcon>
            Donate
          </a>
        </div>
      </div>
      <div style="margin-top: 4rem;">
        <h2 class="h3">Fully <span class="love">open source</span></h2>
        <p style="max-width: 36rem;">
            Quizfreely is released under the AGPL-3.0 license. Our frontend web app, backend API, <a href="https://docs.quizfreely.org" class="link-love with-underline">documentation</a>, and all of our software are all open source on Codeberg and GitHub.
        </p>
        <div class="flex compact-gap">
          <a class="button large faint" href="https://codeberg.org/quizfreely">
            <IconCodeberg></IconCodeberg>
            Codeberg
          </a>
          <a class="button large faint" href="https://github.com/quizfreely">
            <IconGitHub></IconGitHub>
            GitHub
          </a>
        </div>
      </div>
      <!-- {#if data?.featuredRows && data.featuredRows.length >= 1 } -->
      <!-- <h2 class="h3">Find flashcard sets & study guides</h2> -->
      <!-- <p> -->
      <!--   Quizfreely has <span class="s">hundreds of</span> <span class="fg0 i">a few</span> sets made by teachers & students. -->
      <!--   <span class="line"><a href="/explore">Explore more studysets</a></span> -->
      <!-- </p> -->
      <!-- <div class="grid list" style="overflow-wrap:anywhere"> -->
      <!--   {#each data.featuredRows as featuredStudyset } -->
      <!--     <div class="box"> -->
      <!--       <a href={"/studysets/" + featuredStudyset.id}> -->
      <!--         { featuredStudyset.title } -->
      <!--       </a> -->
      <!--       <p class="h6" style="margin-top:0.4rem;margin-bottom:0px"> -->
      <!--         { featuredStudyset.user.displayName } -->
      <!--       </p> -->
      <!--       {#if featuredStudyset.termsCount >= 1} -->
      <!--       <p class="h6" style="margin-top:0.2rem;margin-bottom:0.2rem"> -->
      <!--         { featuredStudyset.termsCount } Terms -->
      <!--       </p> -->
      <!--       {/if} -->
      <!--     </div> -->
      <!--   {/each} -->
      <!-- </div> -->
      <!-- {:else} -->
      <!-- <h2 class="h3">Find flashcard sets & study guides</h2> -->
      <!-- <p>Quizfreely has <span class="s">hundreds of</span> <span class="fg0 i">a few</span> sets made by teachers & students.</p> -->
      <!-- <div class="flex" style="margin-bottom: 2rem;"> -->
      <!--   <a href="/explore" class="button"> -->
      <!--     Explore -->
      <!--   </a> -->
      <!-- </div> -->
      <!-- {/if} -->
      <!--<div class="flex">
        <a href="/sign-up" class="button">
          Create account
        </a>
        <a href="/dashboard" class="button alt">
          Study without an account
        </a>
      </div>
      <p>Already have an account? <a href="/sign-in">Sign in</a></p>-->
    </div>
  </div>
</main>
<style>
    .grid-list-but-different,
    .grid.list.grid-list-but-different {
        grid-template-columns: 1fr 1fr 1fr;
    }
    @media only screen and (max-width: 1400px) {
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
