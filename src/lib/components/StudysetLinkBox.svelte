<script>
    import { goto } from "$app/navigation";
    let {
        studyset,
        linkTemplateFunc,
        showDropdown = false,
        dropdownContent,
        button = false,
        buttonOnClick = () => goto(linkTemplateFunc(studyset.id)),
        extraStyle = "",
    } = $props();
    import Dropdown from "$lib/components/Dropdown.svelte";
    import MoreIcon from "$lib/icons/MoreDotsVertical.svelte";
</script>
<div>
    {#snippet inner()}
        <p style="margin-bottom: 0px;">{ studyset.title }</p>
        <p class="h6 fg0" style="margin-top: 0px; margin-bottom: 0px;">{studyset.termsCount ?? 0} {studyset.termsCount == 1 ? "Term" : "Terms"}</p>
    {/snippet}
    {#if button}
    <button onclick={buttonOnClick} class="button-box" style="display: flex; gap: 0.4rem; flex-direction: column; text-align: start; align-items: start; align-content: start; justify-content: space-between; height: 100%; {extraStyle}">
        {@render inner()}
    </button>
    {:else}
    <a href={linkTemplateFunc(studyset.id)} class="button button-box" style="display: flex; gap: 0.4rem; flex-direction: column; text-align: start; align-items: start; align-content: start; justify-content: space-between; height: 100%; {extraStyle}">
        {@render inner()}
    </a>
    {/if}
    {#if showDropdown}
    <div class="flex" style="justify-content: end; position: relative; margin-top: 0px; margin-bottom: 0px;">
        <Dropdown button={{class:"dropdown-toggle"}} container={{style:"position: absolute; bottom: 0.2rem;"}}>
            {#snippet buttonContent()}
                <MoreIcon class="text fg0"></MoreIcon>
            {/snippet}
            {#snippet divContent(hideFunc)}
                {@render dropdownContent?.(studyset, hideFunc)}
            {/snippet}
        </Dropdown>
    </div>
    {/if}
</div>
