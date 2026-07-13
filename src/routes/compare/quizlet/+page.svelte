<script>
    import QuizfreelyLogo from "$lib/svg/QuizfreelyLogo.svelte";
    import CheckmarkIcon from "$lib/icons/Checkmark.svelte";
    import XMarkIcon from "$lib/icons/CloseXMark.svelte";
    import HeartIcon from "$lib/icons/Heart.svelte";
    import IconCodeberg from "$lib/icons/Codeberg.svelte";
    import IconGitHub from "$lib/icons/GitHub.svelte";
    import NoIcon from "$lib/icons/No.svelte";
    import InfinityIcon from "$lib/icons/Infinity.svelte";
</script>

<svelte:head>
    <title>Free Open Source Quizlet Alternative: Quizfreely vs Quizlet</title>
    <meta name="description" content="Quizfreely is a free and open source alternative to Quizlet with no ads, unlimited free practice tests, free images/media on flashcards, and many Quizlet Plus features for free!" />
    <meta name=”robots” content="index, follow" />
    <link rel="canonical" href="https://quizfreely.org/compare/quizlet" />
</svelte:head>

<div class="grid page" style="margin-top: 4rem;">
    <div class="content">
        <h1 class="h2">Quizfreely vs Quizlet</h1>
        <p style="max-width: 40rem;">Quizfreely is a free and open source studying platform. Quizfreely has no ads, unlimited free practice tests, free images/media for flashcards, and many more features that are free on Quizfreely but require a paid subscription on Quizlet.</p>
        <div class="flex">
            <a href="/sign-up" class="button large">
                Get Started
            </a>
            <a href="/about" class="button large alt">
                Learn More
            </a>
        </div>
    </div>
</div>
<div class="wave-top extra-bg" style="margin-top: 0px;"></div>
  <div class="grid page extra">
    <div class="content">
        <table class="inner background-bg1" style="padding: 1rem; border: none;">
            <thead>
                <tr>
                    <th class="specific-responsive-padding">Features</th>
                    <th>Quizfreely</th>
                    <th>Quizlet</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Advertisements</td>
                    <td>
                        <div class="flex text yay" style="gap: 0.4rem; align-items: center;">
                            <NoIcon></NoIcon>
                            No Ads
                        </div>
                    </td>
                    <td>
                        <div class="flex text ohno" style="gap: 0.4rem; align-items: center;">
                            <CheckmarkIcon></CheckmarkIcon>
                            Ads
                        </div>
                    </td>
                </tr>
                <tr>
                    <td>Free Practice Tests</td>
                    <td>
                        <div class="flex text yay" style="gap: 0.4rem; align-items: center;">
                            <InfinityIcon></InfinityIcon>
                            Unlimited
                        </div>
                    </td>
                    <td>
                        <div class="flex text ohno" style="gap: 0.4rem; align-items: center;">
                            <XMarkIcon></XMarkIcon>
                            1 per day
                        </div>
                    </td>
                </tr>
                <tr>
                    <td>Attach Images</td>
                    <td>
                        <div class="flex text yay" style="gap: 0.4rem; align-items: center;">
                            <CheckmarkIcon></CheckmarkIcon>
                            Free
                        </div>
                    </td>
                    <td>
                        <div class="flex text ohno" style="gap: 0.4rem; align-items: center;">
                            <XMarkIcon></XMarkIcon>
                            Paid
                        </div>
                    </td>
                </tr>
                <tr>
                    <td>User-Friendly Interface</td>
                    <td>
                        <div class="flex text yay" style="gap: 0.4rem; align-items: center;">
                            <CheckmarkIcon></CheckmarkIcon>
                            Yes
                        </div>
                    </td>
                    <td>
                        <div class="flex text yay" style="gap: 0.4rem; align-items: center;">
                            <CheckmarkIcon></CheckmarkIcon>
                            Yes
                        </div>
                    </td>
                </tr>
                <tr>
                    <td>Open Source</td>
                    <td>
                        <div class="flex text yay" style="gap: 0.4rem; align-items: center;">
                            <CheckmarkIcon></CheckmarkIcon>
                            Yes
                        </div>
                    </td>
                    <td>
                        <div class="flex text ohno" style="gap: 0.4rem; align-items: center;">
                            <XMarkIcon></XMarkIcon>
                            No
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
      <div class="grid paragraph" style="margin-top: 4rem;">
        <div class="content">
          <h2 class="h3">You can import Quizlet sets by pasting a link</h2>
          <p style="max-width: 40rem;">
              Quizfreely has unlimited practice tests for free, unlike other flashcard websites or studying apps. Quizfreely is open source and nonprofit, and there are no paid features or subscriptions.
          </p>
        </div>
        <div class="image">
            example
        </div>
      </div>
      <div style="margin-top: 4rem;">
        <h2 class="h3" style="max-width: 40rem;"><span class="extra">Advanced features</span> to measure &amp; improve your studying habits</h2>
        <p style="max-width: 40rem;">
            Quizfreely records individual terms' &amp; flashcards' progress &amp; accuracy. It calculates frequently confused terms or definitions and finds which incorrect answer choices are selected the most. Also, there's cool graphs and charts and stuff.
        </p>
      </div>
    </div>
  </div>
  <div class="wave-bottom extra-bg"></div>
  <div class="grid page">
    <div class="content">
      <div>
        <h2 class="h3">You can easily import Quizlet sets</h2>
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
            Quizfreely is released under the AGPL-3.0 license. Our frontend web app, backend API, <a href="https://quizfreely.org/docs" class="link-love with-underline">documentation</a>, and all of our software are all open source on Codeberg and GitHub.
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
    </div>
  </div>
<style>
    .grid-list-but-different,
    .grid.list.grid-list-but-different {
        grid-template-columns: 1fr 1fr 1fr;
    }
    .specific-responsive-padding {
        padding-right: 10rem;
    }
    @media only screen and (max-width: 1400px) {
        .grid-list-but-different,
        .grid.list.grid-list-but-different {
            grid-template-columns: 1fr 1fr;
        }
        .specific-responsive-padding {
            padding-right: 8rem;
        }
    }
    @media only screen and (max-width: 800px) {
        .grid-list-but-different,
        .grid.list.grid-list-but-different {
            grid-template-columns: 1fr;
        }
        .specific-responsive-padding {
            padding-right: 0px;
        }
    }
</style>
