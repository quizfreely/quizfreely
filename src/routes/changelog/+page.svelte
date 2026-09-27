<script>
    import IconCodeberg from "$lib/icons/Codeberg.svelte";
    import IconGitHub from "$lib/icons/GitHub.svelte";
    import V2x0x0 from "$lib/changelog/v2.0.0.svelte";
    import V1x7x0 from "$lib/changelog/v1.7.0.svelte";
    import V1x6x0 from "$lib/changelog/v1.6.0.svelte";
</script>
<svelte:head>
    <title>Changelog | Quizfreely</title>
    <meta name="description" content="Quizfreely's Changelog lists new features and updates to Quizfreely. Quizfreely is open source and made by students/contributors who work on this project for free." />
    <meta name="robots" content="index, follow" />
</svelte:head>
<div class="grid page">
    <div class="content" style="padding-top: 2rem;">
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
        <V1x7x0 />
        <V1x6x0 />
    </div>
</div>
