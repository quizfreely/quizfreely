<script>
    import { goto } from "$app/navigation";
    import { studysetSelection } from "$lib/studyset-selection.svelte.js";
    import Dropdown from "$lib/components/Dropdown.svelte";
    import MoreIcon from "$lib/icons/MoreDotsVertical.svelte";
    let {
        studyset,
        linkTemplateFunc,
        showDropdown = false,
        dropdownContent,
        button = false,
        buttonOnClick = () => goto(linkTemplateFunc(studyset.id)),
    } = $props();

    const selected = $derived(studysetSelection.cloudIds.has(studyset.id) || studysetSelection.localIds.has(studyset.id));
</script>
<div>
    {#snippet inner()}
        <p style="margin-bottom: 0px;">{ studyset.title }</p>
        <p class="h6 fg0" style="margin-top: 0px; margin-bottom: 0px;">{studyset.termsCount ?? 0} {studyset.termsCount == 1 ? "Term" : "Terms"}</p>
    {/snippet}
    {#if button}
    <button onclick={(e) => buttonOnClick(e, studyset)} class="button-box {selected ? "text main" : ""}" style="display: flex; gap: 0.4rem; flex-direction: column; text-align: start; align-items: start; align-content: start; justify-content: space-between; height: 100%; width: 100%; {selected ? "border: 0.2rem solid var(--main);" : ""}">
        {@render inner()}
    </button>
    {:else}
    <a href={linkTemplateFunc(studyset.id)} class="button button-box" style="display: flex; gap: 0.4rem; flex-direction: column; text-align: start; align-items: start; align-content: start; justify-content: space-between; height: 100%; width: 100%; {selected ? "border: 0.2rem solid var(--fg-0);" : ""}">
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
