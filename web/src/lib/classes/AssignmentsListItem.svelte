<script>
    let { title, amIATeacher, trustedEditHref, trustedViewHref, descriptionSafeHtml, renderedDueDate } = $props();
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
        display: flex;
        width: 100%;
        justify-content: space-between;
        align-items: center;
        text-align: start;
        background-color: var(--bg2);
        color: var(--fg1);
        border-radius: 0.8rem;
        padding: 1rem;
        font-weight: normal;
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
    <button class="container-thing-button no-clickable-effect" onclick={() => open = !open}>
        <span>{ title }</span>
        {#if renderedDueDate}
        <span style="margin-top: 0px;">Due {renderedDueDate}</span>
        {/if}
    </button>
    {#if open}
    <div class="container-thing-inside">
        <div>{@html descriptionSafeHtml}</div>
        <div class="flex" style="margin-top: 0px;">
            {#if amIATeacher}
                <a href={trustedEditHref} class="button faint">
                    Edit
                </a>
            {/if}
            <a href={trustedViewHref} class="button faint">
                View Assignment
            </a>
        </div>
    </div>
    {/if}
</div>
