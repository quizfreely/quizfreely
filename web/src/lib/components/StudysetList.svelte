<script>
    import { fancyTimestamp } from "$lib/fancyTimestamp";
    import db from "$lib/idb-api-layer/db.js";
    import idbApiLayer from "$lib/idb-api-layer/idb-api-layer.js";
    import { onMount } from "svelte";
    import { slide } from "svelte/transition";
    import MoreIcon from "$lib/icons/MoreDotsVertical.svelte";

    let {
        data,
        cloudLinkTemplateFunc,
        localLinkTemplateFunc,
        cloudEmptyMsg,
        localEmptyMsg,
        hideTypeWhenCloudEmptyAndLocalExists,
        collapseCloud = true,
        collapseLocal = true,
        collapseSaved = true,
        showCloudDropdown = false,
        cloudDropdownContent,
        showLocalDropdown = false,
        localDropdownContent,
        showSavedDropdown = false,
        savedDropdownContent
    } = $props();

    let localStudysetList = $state([]);

    let cloudCurrentlyCollapsed = $state(true);
    let localCurrentlyCollapsed = $state(true);
    let savedCurrentlyCollapsed = $state(true);

    onMount(async function () {
        console.log(data)
        localStudysetList = await db.studysets.orderBy("updatedAt").toArray();
        for (const studyset of localStudysetList) {
            studyset.termsCount = (await idbApiLayer.getTermsByStudysetId(studyset.id))?.length ?? 0;
        }
    })

    const COLLAPSE_LENGTH = 6;
</script>

<div>
    {#if data.authed && !(hideTypeWhenCloudEmptyAndLocalExists && !(data.studysetList?.length > 0) && localStudysetList?.length > 0)}
        <div class="grid list" style="overflow-wrap: anywhere; {
            collapseCloud && data.studysetList?.length > COLLAPSE_LENGTH ?
                "margin-bottom: 0px;" : ""
        }">
            {#if data.studysetList && data.studysetList.length > 0}
                {#each data.studysetList as studyset, index}
                    {#if !(collapseCloud && index >= COLLAPSE_LENGTH && cloudCurrentlyCollapsed)}
                    <div>
                        <a href={cloudLinkTemplateFunc(studyset.id)} class="button button-box" style="display: flex; gap: 0.4rem; flex-direction: column; text-align: start; align-items: start; align-content: start; justify-content: space-between; height: 100%;">
                            <p style="margin-bottom: 0px;">{ studyset.title }</p>
                            <p class="h6 fg0" style="margin-top: 0px; margin-bottom: 0px;">{studyset.termsCount ?? 0} {studyset.termsCount == 1 ? "Term" : "Terms"}</p>
                        </a>
                        {#if showCloudDropdown}
                        <div class="flex" style="justify-content: end; position: relative; margin-top: 0px; margin-bottom: 0px;">
                            <div class="dropdown left" style="position: absolute; bottom: 0.2rem;">
                                <button class="dropdown-toggle">
                                    <MoreIcon class="text fg0"></MoreIcon>
                                </button>
                                <div class="content">
                                    {@render cloudDropdownContent?.(studyset)}
                                </div>
                            </div>
                        </div>
                        {/if}
                    </div>
                    {/if}
                {/each}
            {:else}
                {@render cloudEmptyMsg()}
            {/if}
        </div>
        {#if collapseCloud && data.studysetList?.length > COLLAPSE_LENGTH}
            <div class="flex center" style="width: 100%; margin-top: 0.6rem;">
                <button class="faint" onclick={() => cloudCurrentlyCollapsed = !cloudCurrentlyCollapsed}>
                    {cloudCurrentlyCollapsed ? "Show All" : "Collapse"}
                </button>
            </div>
        {/if}
    {/if}
    {#if data.authed && localStudysetList?.length > 0 && !(
        hideTypeWhenCloudEmptyAndLocalExists && !(data.studysetList?.length > 0) && localStudysetList?.length > 0
    )}
        <p class="h4" style="margin-top: 0.6rem;">Local Studysets</p>
    {/if}
    <div class="grid list" style="overflow-wrap: anywhere; {
            collapseLocal && localStudysetList?.length > COLLAPSE_LENGTH ?
                "margin-bottom: 0px;" : ""
        }">
        {#each localStudysetList as studyset, index}
            {#if !(collapseLocal && index >= COLLAPSE_LENGTH && localCurrentlyCollapsed)}
                <div>
                    <a href={localLinkTemplateFunc(studyset.id)} class="button button-box" style="display: flex; gap: 0.4rem; flex-direction: column; text-align: start; align-items: start; align-content: start; justify-content: space-between; height: 100%;">
                        <p style="margin-bottom: 0px;">{ studyset.title }</p>
                        <p class="h6 fg0" style="margin-top: 0px; margin-bottom: 0px;">{studyset.termsCount ?? 0} {studyset.termsCount == 1 ? "Term" : "Terms"}</p>
                    </a>
                    {#if showLocalDropdown}
                        <div class="flex" style="justify-content: end; position: relative; margin-top: 0px; margin-bottom: 0px;">
                            <div class="dropdown left" style="position: absolute; bottom: 0.2rem;">
                                <button class="dropdown-toggle">
                                    <MoreIcon class="text fg0"></MoreIcon>
                                </button>
                                <div class="content">
                                    {@render localDropdownContent?.(studyset)}
                                </div>
                            </div>
                        </div>
                    {/if}
                </div>
            {/if}
        {/each}
        {#if !data.authed && localStudysetList.length == 0}
            <!-- only show empty message here if user is logged out and therefore can only have local studysets -->
            {@render localEmptyMsg()}
        {/if}
    </div>
    {#if collapseLocal && localStudysetList?.length > COLLAPSE_LENGTH}
        <div class="flex center" style="width: 100%; margin-top: 0.6rem;">
            <button class="faint" onclick={() => localCurrentlyCollapsed = !localCurrentlyCollapsed}>
                {localCurrentlyCollapsed ? "Show All" : "Collapse"}
            </button>
        </div>
    {/if}
    {#if data.mySavedStudysets?.length > 0}
        <p class="h4" style="margin-top: 0.6rem;">Saved Studysets</p>
        <div class="grid list" style="overflow-wrap: anywhere; {
            collapseSaved && data.mySavedStudysets?.length > COLLAPSE_LENGTH ?
                "margin-bottom: 0px;" : ""
        }">
            {#each data.mySavedStudysets as studyset, index}
                {#if !(collapseSaved && index >= COLLAPSE_LENGTH && savedCurrentlyCollapsed)}
                <div>
                    <a href={cloudLinkTemplateFunc(studyset.id)} class="button button-box" style="display: flex; gap: 0.4rem; flex-direction: column; text-align: start; align-items: start; align-content: start; justify-content: space-between; height: 100%;">
                        <p style="margin-bottom: 0px;">{ studyset.title }</p>
                        <p class="h6 fg0" style="margin-top: 0px; margin-bottom: 0px;">{studyset.termsCount ?? 0} {studyset.termsCount == 1 ? "Term" : "Terms"}</p>
                    </a>
                    {#if showSavedDropdown}
                    <div class="flex" style="justify-content: end; position: relative; margin-top: 0px; margin-bottom: 0px;">
                        <div class="dropdown left" style="position: absolute; bottom: 0.2rem;">
                            <button class="dropdown-toggle">
                                <MoreIcon class="text fg0"></MoreIcon>
                            </button>
                            <div class="content">
                                {@render savedDropdownContent?.(studyset)}
                            </div>
                        </div>
                    </div>
                    {/if}
                </div>
                {/if}
            {/each}
        </div>
        {#if collapseSaved && data.mySavedStudysets?.length > COLLAPSE_LENGTH}
            <div class="flex center" style="width: 100%; margin-top: 0.6rem;">
                <button class="faint" onclick={() => savedCurrentlyCollapsed = !savedCurrentlyCollapsed}>
                    {savedCurrentlyCollapsed ? "Show All" : "Collapse"}
                </button>
            </div>
        {/if}
    {/if}
</div>
