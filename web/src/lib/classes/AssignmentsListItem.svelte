<script>
    let { title, amIATeacher, trustedEditHref, trustedStudentViewHref, trustedTeacherViewHref, descriptionSafeHtml, renderedDueDate, hideTeacherViewButton } = $props();
    let open = $state(false);
</script>
<style>
    .container-thing {
        padding: 0px;
        background-color: var(--bg-2);
        border-radius: 0.8rem;
    }
    .container-thing-button,
    button.container-thing-button {
        display: flex;
        width: 100%;
        justify-content: space-between;
        align-items: center;
        text-align: start;
        background-color: var(--bg-2);
        color: var(--fg-1);
        border-radius: 0.8rem;
        padding: 1rem;
        font-weight: normal;
    }
    .container-thing-button:hover,
    button.container-thing-button:hover {
        background-color: var(--bg-3);
    }
    .container-thing-button:focus-visible,
    button.container-thing-button:focus-visible {
        background-color: var(--bg-3);
    }
    .container-thing-inside {
        padding: 1rem;
        margin-top: 0px;
    }
    :global {
        .description-container {
            white-space: pre-wrap;
        }
        .description-container p:empty::before {
            content: "\00a0"; /* nbsp, non-breaking space */
        }
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
        {#if descriptionSafeHtml}<div class="description-container no-child-margin-top">{@html descriptionSafeHtml}</div>{/if}
        <div class="flex">
            {#if amIATeacher}
                <a href={trustedEditHref} class="button alt">
                    Edit
                </a>
                {#if !hideTeacherViewButton}
                <a href={trustedTeacherViewHref} class="button alt">
                    View assignment
                </a>
                {/if}
            {:else}
                <a href={trustedStudentViewHref} class="button alt">
                    View assignment
                </a>
            {/if}
        </div>
    </div>
    {/if}
</div>
