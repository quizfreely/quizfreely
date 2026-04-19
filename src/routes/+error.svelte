<script>
    import { page } from "$app/state";
</script>

<div class="grid page">
    <div class="content" style="padding-top: 2rem;">
        <p class="fg0" style="font-size: 1.6rem;">{page.status}</p>
        <h1 class="h2" style="margin-top:0px;">
            {page.error.message}
        </h1>
        {#if page.status == 404}
            <p>Sorry, that page doesn't exist.</p>
            <div class="flex" style="margin-bottom: 4rem;">
                <a class="button alt" href="/">View Homepage?</a>
                <a class="button alt" href="/search">Search?</a>
            </div>
        {/if}
        <p>
            If you found an error or incorrect link, report it so we can fix it:
        </p>
        <p style="margin-top:0.4rem;">
            <a href="https://matrix.to/#/#quizfreely-space:matrix.org"
                >Matrix space</a
            >
            · <a href="https://discord.gg/6qQrybf6kG">Discord server</a>
        </p>
        <p style="margin-top:0.4rem;">
            <a href="https://codeberg.org/quizfreely/quizfreely">Codeberg</a> ·
            <a href="https://github.com/quizfreely/quizfreely">GitHub</a>
        </p>
        <p class="fg0" style="margin-top:2rem;">
            Quizfreely is made by students/contributors who work on this project
            for free.
            <span class="optional-line"
                >Help us improve Quizfreely by posting bug reports, feature
                requests, or questions.</span
            >
        </p>
    </div>
</div>
