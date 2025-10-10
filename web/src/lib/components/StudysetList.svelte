<script>
    import { fancyTimestamp } from "$lib/fancyTimestamp";
    import db from "$lib/idb-api-layer/db.js";
    import idbApiLayer from "$lib/idb-api-layer/idb-api-layer.js";
    import { onMount } from "svelte";
    import { slide } from "svelte/transition";

    let {
        data,
        cloudLinkTemplateFunc,
        localLinkTemplateFunc,
        cloudEmptyMsg,
        localEmptyMsg,
        hideTypeWhenCloudEmptyAndLocalExists,
        collapseCloud = true,
        collapseLocal = true
    } = $props();

    let studysetList;
    let localStudysetList = $state([]);

    let cloudCurrentlyCollapsed = $state(true);
    let localCurrentlyCollapsed = $state(true);

    onMount(async function () {
        localStudysetList = await db.studysets.orderBy("updatedAt").toArray();
        for (const studyset of localStudysetList) {
            studyset.termsCount = (await idbApiLayer.getTermsByStudysetId(studyset.id))?.length ?? 0;
        }
    })
</script>

<div>
    {#if data.authed && !(hideTypeWhenCloudEmptyAndLocalExists && !(data.studysetList?.length > 0) && localStudysetList?.length > 0)}
        <div class="grid list" style="overflow-wrap: anywhere; {
            collapseCloud && data.studysetList?.length > 6 ?
                "margin-bottom: 0px;" : ""
        }" bind:this={studysetList}>
            {#if data.studysetList && data.studysetList.length > 0}
                {#each data.studysetList as studyset, index}
                    {#if !(collapseCloud && index >= 6 && cloudCurrentlyCollapsed)}
                    <a href={cloudLinkTemplateFunc(studyset.id)} class="button button-box" style="display: flex; flex-direction: column; text-align: start; align-items: start; align-content: start; justify-content: space-between;" transition:slide={{ duration: 400 }}>
                        <p style="margin-bottom: 0px;">{ studyset.title }</p>
                        <p class="h6 fg0" style="margin-top: 0.6rem; margin-bottom: 0.2rem;">{studyset.termsCount} Terms</p>
                    </a>
                    {/if}
                {/each}
            {:else}
                {@render cloudEmptyMsg()}
            {/if}
        </div>
        {#if collapseCloud && data.studysetList?.length > 6}
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
        <p class="h4">Local Studysets</p>
    {/if}
    <div class="grid list" style="overflow-wrap: anywhere; {
            collapseLocal && localStudysetList?.length > 6 ?
                "margin-bottom: 0px;" : ""
        }">
        {#each localStudysetList as studyset, index}
            {#if !(collapseLocal && index >= 6 && localCurrentlyCollapsed)}
            <a href={localLinkTemplateFunc(studyset.id)} class="button button-box" style="display: flex; flex-direction: column; text-align: start; align-items: start; align-content: start; justify-content: space-between;" transition:slide={{ duration: 400 }}>
                <p style="margin-bottom: 0px;">{ studyset.title }</p>
                <p class="h6 fg0" style="margin-top: 0.6rem; margin-bottom: 0.2rem;">{studyset.termsCount} Terms</p>
            </a>
            {/if}
        {/each}
        {#if !data.authed && localStudysetList.length == 0}
            <!-- only show empty message here if user is logged out and therefore can only have local studysets -->
            {@render localEmptyMsg()}
        {/if}
    </div>
    {#if collapseLocal && localStudysetList?.length > 6}
        <div class="flex center" style="width: 100%; margin-top: 0.6rem;">
            <button class="faint" onclick={() => localCurrentlyCollapsed = !localCurrentlyCollapsed}>
                {localCurrentlyCollapsed ? "Show All" : "Collapse"}
            </button>
        </div>
    {/if}
</div>
