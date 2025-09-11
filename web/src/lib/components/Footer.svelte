<script>
  import IconCodeberg from "$lib/icons/Codeberg.svelte";
  import IconGitHub from "$lib/icons/GitHub.svelte";
  import HeartIcon from "$lib/icons/Heart.svelte";
</script>

<div id="footer-wave" class="wave-top bg0"></div>
<footer id="footer" class="background-bg0" style="border: none; margin: 0px; padding-top: 1rem; padding-bottom: 8rem;">
    <h2>Quizfreely</h2>
    <p>Quizfreely is free and open source <br> Made by Ehan A & contributors</p>
    <div class="flex center compact-gap">
      <a href="https://codeberg.org/quizfreely/quizfreely" class="button faint">
        <IconCodeberg />
        Codeberg
      </a>
      <a href="https://github.com/quizfreely/quizfreely" class="button faint">
        <IconGitHub />
        GitHub
      </a>
    </div>
          <a href="https://hcb.hackclub.com/donations/start/quizfreely" class="button alt ohno" style="margin-top: 0.6rem;">
            <HeartIcon></HeartIcon> Donate
          </a>
    <div class="grid list" style="text-align: start; padding: 2rem; margin-top: 0px; margin-bottom: 0px;">
      <div>
        <p class="fg0">About</p>
        <div class="flex col compact-gap" style="width:fit-content; margin-top: 0.6rem;">
          <a href="/landing-page">Landing Page</a>
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Service</a>
          <a href="https://hcb.hackclub.com/quizfreely">Transparent Finances</a>
        </div>
      </div>
      <div>
        <p class="fg0">Development</p>
        <div class="flex col compact-gap" style="width:fit-content; margin-top: 0.6rem;">
          <a href="https://codeberg.org/quizfreely/quizfreely">Source Code (Codeberg)</a>
          <a href="https://github.com/quizfreely/quizfreely">Source Code (GitHub)</a>
          <a href="https://quizfreely.org/docs">Documentation</a>
        </div>
      </div>
      <div>
        <p class="fg0">Community</p>
        <div class="flex col compact-gap" style="width:fit-content; margin-top: 0.6rem;">
          <a href="https://matrix.to/#/#quizfreely-space:matrix.org">Matrix Space</a>
          <a href="https://quizfreely.org/discord">Discord Server</a>
        </div>
      </div>
    </div>
    <div style="text-align: start; padding: 0px 2rem">
      <!-- <p> -->
      <!--   v0.32.1 · <a href="https://codeberg.org/quizfreely/quizfreely/releases">Changelog (on Codeberg)</a> or <a href="https://github.com/quizfreely/quizfreely/releases">on GitHub</a> -->
      <!-- </p> -->
      <p class="fg0">
        © 2022-2025 Ehan Ahamed & contributors<br>
        Licensed under AGPL-3.0
      </p>
      <p class="fg0">
        Quizfreely is fiscally sponsored by The Hack Foundation, a 501(c)(3) nonprofit.
      </p>
    </div>
</footer>
