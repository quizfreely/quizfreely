<script>
    import IconCodeberg from "$lib/icons/Codeberg.svelte";
    import IconGitHub from "$lib/icons/GitHub.svelte";
    import V2x0x0 from "$lib/components/features/v2.0.0.svelte";
</script>
<div class="grid page">
    <div class="content">
        <h2>Changelog</h2>
        <p>Source code:</p>
        <div class="flex" style="margin-top: 0.4rem;">
            <a class="button alt text fg1" href="https://codeberg.org/quizfreely/quizfreely">
                <IconCodeberg></IconCodeberg>
                Codeberg
            </a>
            <a class="button alt text fg1" href="https://github.com/quizfreely/quizfreely">
                <IconGitHub></IconGitHub>
                GitHub
            </a>
        </div>
        <V2x0x0 />
    </div>
</div>
