<script>
    import BackArrowIcon from "$lib/icons/BackArrow.svelte";
    import HeartIcon from "$lib/icons/Heart.svelte";
    let { children } = $props();
</script>
<div class="grid page">
    <div class="content">
        <div>
            <a href="/changelog" class="button faint"><BackArrowIcon /> Back to Changelog</a>
        </div>
        {@render children()}
        <div class="box" style="margin-top: 3rem; max-width: 50rem; --bg-love: color-mix(in srgb, var(--love) 10%, var(--bg-2)); background-color: var(--bg-love); border-color: var(--love);">
            <p>Quizfreely is open source and is made by students and contributors who work on this project for free to add these advanced new features.</p>
            <p>If Quizfreely is useful to you, consider donating</p>
            <a class="button love" href="https://hcb.hackclub.com/donations/start/quizfreely"><HeartIcon /> Donate</a>
        </div>
    </div>
</div>
