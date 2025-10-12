<script>
    import Noscript from "$lib/components/Noscript.svelte";
    import StudysetList from "$lib/components/StudysetList.svelte";
    import FolderPicker from "$lib/components/FolderPicker.svelte";
    import IconPlus from "$lib/icons/Plus.svelte";
    import FolderIcon from "$lib/icons/Folder.svelte";
    import BookmarkIcon from "$lib/icons/Bookmark.svelte";
    import PencilIcon from "$lib/icons/Pencil.svelte";

    let { data } = $props();
    let showFolderPicker = $state(false);

    let folderToRename = null;
    let showFolderRenamingFlag = $state(false);
    function showFolderRenaming(folderId) {
        folderIdToRename = folderId;
        showFolderRenamingFlag = true;
    }

    let studysetListComponent;
</script>

<svelte:head>
  <title>Quizfreely</title>
</svelte:head>

<Noscript />
<div>
    {#if !data.authed}
        <p id="dashboard-noaccount-alert" class="fg0">
            You're not signed in, so your sets will be saved locally (on your device)
        </p>
    {/if}
    {#snippet topMenu()}
    <div class="flex">
        <a href="/studyset/create" class="button">
            <IconPlus />
            New Studyset
        </a>
        <button class="alt" onclick={() => showNewFolderModal = true}>
            <FolderIcon></FolderIcon>
            New Folder
        </button>
    </div>
    {/snippet}
    {#snippet folderMenu(folder)}
    <div class="flex">
        <a href="/studyset/create?folderId={folder?.id}" class="button">
            <IconPlus />
            New Studyset
        </a>
        <button class="alt" onclick={() => showFolderRenaming(folder.id)}>
            <PencilIcon />
            Rename Folder
        </button>
    </div>
    {/snippet}

    {#snippet emptyMsg()}
        <div class="box flex center-h center-v">
            <p class="fg0">Select "New Studyset" to enter or import terms</p>
        </div>
    {/snippet}
    {#snippet cloudDropdownContent(studyset)}
        {#if studyset?.folder}
            <button><FolderIcon></FolderIcon> Change Folder</button>
        {:else}
            <button onclick={() => console.log(studyset)}><FolderIcon></FolderIcon> Add to Folder</button>
        {/if}
    {/snippet}
    {#snippet savedDropdownContent(studyset)}
        {#if studyset?.folder}
            <button><FolderIcon></FolderIcon> Change Folder</button>
        {:else}
            <button onclick={() => console.log(studyset)}><FolderIcon></FolderIcon> Add to Folder</button>
        {/if}
        <button onclick={() => console.log(studyset)}>
            <BookmarkIcon></BookmarkIcon> Unsave
        </button>
    {/snippet}
    <StudysetList
        bind:this={studysetListComponent}
        {data}
        cloudLinkTemplateFunc={(id) => `/studysets/${id}`}
        localLinkTemplateFunc={(id) => `/studyset/local?id=${id}`}
        cloudEmptyMsg={emptyMsg}
        localEmptyMsg={emptyMsg}
        collapseCloud={true}
        collapseLocal={true}
        collapseSaved={true}
        showCloudDropdown={true}
        {cloudDropdownContent}
        showLocalDropdown={false}
        showSavedDropdown={true}
        {savedDropdownContent}
        {topMenu}
        {folderMenu}
    ></StudysetList>
</div>
{#if showNewFolderModal}
    
{/if}
