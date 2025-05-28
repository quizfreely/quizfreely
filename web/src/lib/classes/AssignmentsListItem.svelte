<script>
    let open = $state(false);
</script>
<style>
    .container-thing {
        padding: 0px;
        background-color: var(--bg2);
        border-radius: 0.8rem;
    }
    .container-thing-button,
    button.container-thing-button {
        display: block;
        width: 100%;
        text-align: start;
        background-color: var(--bg2);
        color: var(--fg1);
        border-radius: 0.8rem;
    }
    .container-thing-button:hover,
    button.container-thing-button:hover {
        background-color: var(--bg3);
    }
    .container-thing-button:focus-visible,
    button.container-thing-button:focus-visible {
        background-color: var(--bg3);
    }
    .container-thing-inside {
        padding: 1rem;
        margin-top: 0px;
    }
</style>
<div class="container-thing">
    <button class="container-thing-button no-clickable-effect" onclick={() => open = !open}>a</button>
    {#if open}
    <div class="container-thing-inside">
        open
    </div>
    {/if}
</div>
