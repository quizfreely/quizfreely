<script>
    import BackArrowIcon from "$lib/icons/BackArrow.svelte";
    import IconCodeberg from "$lib/icons/Codeberg.svelte";
    import IconGitHub from "$lib/icons/GitHub.svelte";
    import HeartIcon from "$lib/icons/Heart.svelte";
    let { children } = $props();
</script>
<div class="grid page">
    <div class="content">
        <div>
            <a href="/changelog" class="button faint"><BackArrowIcon /> Back to Changelog</a>
        </div>
        {@render children()}
        <div class="box" style="margin-top: 3rem; max-width: 50rem; background-color: color-mix(in srgb, var(--love) 6%, var(--bg-2)); border-color: var(--love);">
            <p>Quizfreely is open-source and non-profit, and is made by students and contributors who work on these new features for free.</p>
            <p>If you find Quizfreely useful, consider donating</p>
            <a class="button love" href="https://hcb.hackclub.com/donations/start/quizfreely"><HeartIcon /> Donate</a>

            <p style="margin-top: 2rem;">If you use GitHub or Codeberg, consider starring Quizfreely too</p>
            <div class="flex">
                <a href="https://github.com/quizfreely/quizfreely" class="button alt text fg1">
                  <IconGitHub />
                  Star on GitHub
                </a>
                <a href="https://codeberg.org/quizfreely/quizfreely" class="button alt text fg1">
                  <IconCodeberg />
                  Star on Codeberg
                </a>
            </div>
        </div>
    </div>
</div>
