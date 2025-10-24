<script>
    import { page } from "$app/state";
</script>
<div class="grid page">
    <div class="content">
        <h1 style="margin-bottom:0px;">{page.status}</h1>
        <p class="h4" style="margin-top:0.2rem;margin-bottom:2rem;">{page.error.message}</p>
        {#if page.status == 404}
            <p style="margin-bottom:2rem;"><a href="/">Home</a> · <a href="/search">Search</a></p>
        {/if}
        <p>If you found an error or incorrect link, report it so we can fix it:</p>
        <p style="margin-top:0.4rem;"><a href="https://matrix.to/#/#quizfreely-space:matrix.org">Matrix space</a> · <a href="https://discord.gg/6qQrybf6kG">Discord server</a></p>
        <p style="margin-top:0.4rem;"><a href="https://codeberg.org/quizfreely/quizfreely">Codeberg</a> · <a href="https://github.com/quizfreely/quizfreely">GitHub</a></p>
        <p class="fg0" style="margin-top:4rem;">Quizfreely is made by students/contributors who work on this project for free. Help us improve Quizfreely by posting bug reports, feature requests, or questions.</p>
    </div>
</div>
