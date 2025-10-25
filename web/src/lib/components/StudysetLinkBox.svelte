<script>
    let {
        studyset,
        linkTemplateFunc,
        showDropdown = false,
        dropdownContent
    } = $props();
    import Dropdown from "$lib/components/Dropdown.svelte";
    import MoreIcon from "$lib/icons/MoreDotsVertical.svelte";
</script>
<div>
    <a href={linkTemplateFunc(studyset.id)} class="button button-box" style="display: flex; gap: 0.4rem; flex-direction: column; text-align: start; align-items: start; align-content: start; justify-content: space-between; height: 100%;">
        <p style="margin-bottom: 0px;">{ studyset.title }</p>
        <p class="h6 fg0" style="margin-top: 0px; margin-bottom: 0px;">{studyset.termsCount ?? 0} {studyset.termsCount == 1 ? "Term" : "Terms"}</p>
    </a>
    {#if showDropdown}
    <div class="flex" style="justify-content: end; position: relative; margin-top: 0px; margin-bottom: 0px;">
        <Dropdown button={{class:"dropdown-toggle"}} container={{style:"position: absolute; bottom: 0.2rem;"}}>
            {#snippet buttonContent()}
                <MoreIcon class="text fg0"></MoreIcon>
            {/snippet}
            {#snippet divContent()}
                {@render dropdownContent?.(studyset)}
            {/snippet}
        </Dropdown>
    </div>
    {/if}
</div>
