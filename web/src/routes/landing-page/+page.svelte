<script>
    let { data } = $props();
    import HeartIcon from "$lib/icons/Heart.svelte";
    import IconCodeberg from "$lib/icons/Codeberg.svelte";
    import IconGitHub from "$lib/icons/GitHub.svelte";
</script>

<svelte:head>
    <title>Quizfreely: Free & Open Source Studying Tool</title>
    <meta name="description" content="Quizfreely is a free and open source learning app with flashcards, practice tests, and more tools to help you study." />
    <meta name=”robots” content="index, follow" />
    <link rel="canonical" href="https://quizfreely.org" />
</svelte:head>

<main>
<div class="grid intro" style="margin-bottom: 0px; padding-bottom: 0px; border:none">
    <div class="logotype">
      <div class="logo">
        <svg
           viewBox="0 0 512 512"
           version="1.1"
           id="svg1"
           xml:space="preserve"
           xmlns:xlink="http://www.w3.org/1999/xlink"
           xmlns="http://www.w3.org/2000/svg"
           xmlns:svg="http://www.w3.org/2000/svg"><defs
             id="defs1"><linearGradient
               id="linearGradient1"><stop
                 style="stop-color: var(--main-gradient-light-stop-color, #7ca4fe); stop-opacity:1;"
                 offset="0"
                 id="stop1" /><stop
                 style="stop-color: var(--main-gradient-dark-stop-color, #4c5cf2); stop-opacity:1;"
                 offset="1"
                 id="stop2" /></linearGradient><linearGradient
               xlink:href="#linearGradient1"
               id="linearGradient2"
               x1="388.59506"
               y1="123.40449"
               x2="123.40467"
               y2="388.59488"
               gradientUnits="userSpaceOnUse" /></defs><g
             id="layer1"><path
               id="path1"
               style="fill:url(#linearGradient2);fill-opacity:1;stroke-width:0.976652"
               d="M 130.98828,6 C 113.75037,6 68.482,6 68.482,6 c 0,0 0,45.267945 0,62.505859 l 4.22e-4,203.143551 v 203.14356 c 0,11.2315 6.055743,21.68114 15.822266,27.15039 9.766524,5.46926 21.778402,5.37162 31.447262,-0.39063 L 256,417.46289 396.15039,501.55273 c 9.66886,5.76225 21.68074,5.95755 31.44727,0.39063 9.76652,-5.56691 15.91992,-15.91889 15.91992,-27.15039 L 443.518,6 Z M 359.6875,95.041016 c 6.92391,-0.07611 11.74967,3.706695 16.29883,8.292964 6.11307,7.59569 6.77618,18.64249 0.7832,26.88282 L 239.62891,318.7832 c -3.80694,5.26051 -9.73129,8.52106 -16.16211,9.06836 -6.5353,0.55619 -12.87048,-1.89196 -17.40625,-6.42773 l -68.57422,-68.57422 c -8.61052,-8.61052 -8.61053,-22.72933 0,-31.33984 8.61052,-8.61052 22.72932,-8.61052 31.33984,0 L 219.06641,271.75 340.98438,104.13672 c 4.47271,-6.149988 11.58963,-9.326467 18.70312,-9.095704 z" /></g></svg>
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
  <div class="wave-top extra-bg"></div>
  <div class="grid page extra">
    <div class="content">
      <div>
        <h2 class="h3">It's <span class="extra">free</span> and <span class="extra">open source</span></h2>
        <p style="max-width: 36rem;">
          Quizfreely is made by volunteers and contributors.
          Quizfreely is not owned by any company or buisness.
          You can see our source code and contribute on Codeberg or GitHub.
        </p>
        <div class="flex">
          <a class="button extra" href="https://codeberg.org/quizfreely/quizfreely">
            Codeberg
          </a>
          <a class="button extra alt" href="https://github.com/quizfreely/quizfreely">
            GitHub
          </a>
        </div>
      </div>
    </div>
  </div>
  <div class="wave-bottom extra-bg"></div>
  <div class="grid page">
    <div class="content">
      <div>
        <h2 class="h3">Quizfreely is <span class="love">nonprofit</span></h2>
        <p>
            Quizfreely is a nonprofit project with <a href="https://hcb.hackclub.com/quizfreely" class="link-love with-underline">transparent finances</a>.<br>
            We're fiscally sponsored by <a class="link-love with-underline" href="https://the.hackfoundation.org">The Hack Foundation</a>, a <span style="white-space: nowrap;">501(c)(3)</span> nonprofit.
        </p>
        <div class="flex">
          <a class="button large love" href="https://hcb.hackclub.com/donations/start/quizfreely">
            <HeartIcon></HeartIcon>
            Donate
          </a>
        </div>
      </div>
      <div style="margin-top: 4rem;">
        <h2 class="h3">Fully open source</h2>
        <p style="max-width: 40rem;">
            Quizfreely is released under the AGPL-3.0 license. Our frontend web app, backend API, and all of our software are all open source on Codeberg and GitHub.
        </p>
        <div class="flex compact-gap">
          <a class="button large faint" href="https://codeberg.org/quizfreely">
            <IconCodeberg></IconCodeberg>
            Codeberg
          </a>
          <a class="button large faint" href="https://codeberg.org/quizfreely">
            <IconGitHub></IconGitHub>
            GitHub
          </a>
        </div>
      </div>
      <!-- {#if data?.featuredRows && data.featuredRows.length >= 1 } -->
      <!-- <h2 class="h3">Find flashcard sets & study guides</h2> -->
      <!-- <p> -->
      <!--   Quizfreely has <span class="s">hundreds of</span> <span class="fg0 i">a few</span> sets made by teachers & students.<br /> -->
      <!--   <a href="/explore">Explore more studysets</a> -->
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
      <!-- <div class="flex"> -->
      <!--   <a href="/explore" class="button"> -->
      <!--     Explore -->
      <!--   </a> -->
      <!-- </div> -->
      <!-- <br /> -->
      <!-- <br /> -->
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
