<script>
    import { fancyTimestamp } from "$lib/fancyTimestamp";
    import db from "$lib/idb-api-layer/db.js";
    import idbApiLayer from "$lib/idb-api-layer/idb-api-layer.js";
    import { onMount } from "svelte";
    import { slide, fade } from "svelte/transition";
    import { sineIn, sineOut } from "svelte/easing";
    import StudysetLinkBox from "$lib/components/StudysetLinkBox.svelte";
    import MoreIcon from "$lib/icons/MoreDotsVertical.svelte";
    import LocalIcon from "$lib/icons/Local.svelte";
    import BookmarkIcon from "$lib/icons/Bookmark.svelte";
    import FolderIcon from "$lib/icons/Folder.svelte";

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

    let transKey = $state(0);

    let showErrorBox = $state(false);
    let errorBoxText = $state("");
    let inFolder = $state(false);
    let folderStudysets = $state([]);
    async function viewFolder(id) {
        inFolder = true;
        try {
            const respRaw = await fetch("/api/graphql", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    query: `query ($id: ID!){
    folder(id: $id) {
        id
        name
        studysets {
            id
            title
            termsCount
        }
    }
}`,
                    variables: {
                        id
                    }
                })
            });
            const resp = await respRaw.json()
            if (resp?.data?.folder) {
                folderStudysets = resp.data.folder.folderStudysets
                showErrorBox = false;
                inFolder = true;
                transKey++;
            } else {
                console.log("unsucessful response while loading folder: ", resp);
                errorBoxText = "Error loading folder :("
                showErrorBox = true;
            }
        } catch (err) {
            console.error(err);
            errorBoxText = "Error loading folder :("
            showErrorBox = true;
        }
    }
</script>

{#key transKey}
<div in:fade={{ duration: 120, delay: 120, easing: sineIn }} out:fade={{ duration: 120, easing: sineOut }}>
    {#if showErrorBox}
        <div class="box ohno" transition:slide={{duration:400}}>
            <p>{errorBoxText}</p>
        </div>
    {/if}
    {#if inFolder}
    {:else}
    {#if data.myFolders?.length > 0}
        <div class="grid list">
            {#each data.myFolders as folder}
                <button class="button-box" onclick={() => viewFolder(folder.id)}>
                    <FolderIcon></FolderIcon> {folder.name}
                </button>
            {/each}
        </div>
    {/if}
    {#if data.authed && !(hideTypeWhenCloudEmptyAndLocalExists && !(data.studysetList?.length > 0) && localStudysetList?.length > 0)}
        <div class="grid list" style="overflow-wrap: anywhere; {
            collapseCloud && data.studysetList?.length > COLLAPSE_LENGTH ?
                "margin-bottom: 0px;" : ""
        }">
            {#if data.studysetList && data.studysetList.length > 0}
                {#each data.studysetList as studyset, index}
                    {#if !(collapseCloud && index >= COLLAPSE_LENGTH && cloudCurrentlyCollapsed)}
                        <StudysetLinkBox
                            {studyset}
                            linkTemplateFunc={cloudLinkTemplateFunc}
                            showDropdown={showCloudDropdown}
                            dropdownContent={cloudDropdownContent}
                        ></StudysetLinkBox>
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
        <p class="h4" style="margin-top: 0.6rem;"><LocalIcon></LocalIcon> Local Studysets</p>
    {/if}
    <div class="grid list" style="overflow-wrap: anywhere; {
            collapseLocal && localStudysetList?.length > COLLAPSE_LENGTH ?
                "margin-bottom: 0px;" : ""
        }">
        {#each localStudysetList as studyset, index}
            {#if !(collapseLocal && index >= COLLAPSE_LENGTH && localCurrentlyCollapsed)}
                <StudysetLinkBox
                    {studyset}
                    linkTemplateFunc={localLinkTemplateFunc}
                    showDropdown={showLocalDropdown}
                    dropdownContent={localDropdownContent}
                ></StudysetLinkBox>
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
        <p class="h4" style="margin-top: 0.6rem;"><BookmarkIcon></BookmarkIcon> Saved Studysets</p>
        <div class="grid list" style="overflow-wrap: anywhere; {
            collapseSaved && data.mySavedStudysets?.length > COLLAPSE_LENGTH ?
                "margin-bottom: 0px;" : ""
        }">
            {#each data.mySavedStudysets as studyset, index}
                {#if !(collapseSaved && index >= COLLAPSE_LENGTH && savedCurrentlyCollapsed)}
                    <StudysetLinkBox
                        {studyset}
                        linkTemplateFunc={cloudLinkTemplateFunc}
                        showDropdown={showSavedDropdown}
                        dropdownContent={savedDropdownContent}
                    ></StudysetLinkBox>
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
    {/if}
</div>
{/key}
