<script>
    import { fancyTimestamp } from "$lib/fancyTimestamp";
    import db from "$lib/idb-api-layer/db.js";
    import { onMount } from "svelte";


    let {
        data,
        cloudLinkTemplateFunc,
        localLinkTemplateFunc,
        cloudEmptyMsg,
        localEmptyMsg,
        hideTypeWhenCloudEmptyAndLocalExists,
        collapseCloud,
        collapseLocal
    } = $props();

    let studysetList;
    let localStudysetList = $state([]);

    let cloudCurrentlyCollapsed = $state(true);
    let localCurrentlyCollapsed = $state(true);

    onMount(async function () {
        if (data?.settingsDateTimeFormatHours == "24") {
            fancyTimestamp.hours = 24;
        } else if (data?.settingsDateTimeFormatHours == "12") {
            fancyTimestamp.hours = 12;
        }

        if (data.authed) {
            for (var i = 0; i < studysetList.children.length; i++) {
                var timestampElement = studysetList.children[i].children[1]
                if (timestampElement) {
                  timestampElement.innerText = fancyTimestamp.format(timestampElement.dataset.timestamp);
                }
            }
        }

        const studysets = await db.studysets.orderBy("updatedAt").toArray();
        if (studysets.length >= 1) {
            studysets.sort(function (a, b) {
                return Date.parse(b.updatedAt) - Date.parse(a.updatedAt)
            })
            localStudysetList = studysets;
            for (var i = 0; i < localStudysetList.length; i++) {
                if (localStudysetList[i].updatedAt) {
                    localStudysetList[i].formattedFancyTimestamp = fancyTimestamp.format(
                        localStudysetList[i].updatedAt
                    );
                }
            }
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
                    <div class="box">
                        <a href={cloudLinkTemplateFunc(studyset.id)}>{ studyset.title }</a>
                        <p class="h6" data-timestamp={ studyset.updatedAt }>...</p>
                    </div>
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
            <div class="box">
                <a href={localLinkTemplateFunc(studyset.id)}>{ studyset.title }</a>
                <p class="h6">{studyset.formattedFancyTimestamp}</p>
            </div>
            {/if}
        {/each}
        {#if !data.authed && localStudysetList.length == 0}
            <!-- only show empty message here if user is logged out and therefore can only have local studysets -->
            {@render localEmptyMsg()}
        {/if}
    </div>
    {#if collapseLocal && localStudysetList?.length >= 6}
        <div class="flex center" style="width: 100%; margin-top: 0.6rem;">
            <button class="faint" onclick={() => localCurrentlyCollapsed = !localCurrentlyCollapsed}>
                {localCurrentlyCollapsed ? "Show All" : "Collapse"}
            </button>
        </div>
    {/if}
</div>
