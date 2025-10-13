<script>
    import { slide, fade } from "svelte/transition";
    import Noscript from "$lib/components/Noscript.svelte";
    import StudysetList from "$lib/components/StudysetList.svelte";
    import FolderPicker from "$lib/components/FolderPicker.svelte";
    import IconPlus from "$lib/icons/Plus.svelte";
    import FolderIcon from "$lib/icons/Folder.svelte";
    import BookmarkIcon from "$lib/icons/Bookmark.svelte";
    import PencilIcon from "$lib/icons/Pencil.svelte";
    import CheckmarkIcon from "$lib/icons/Checkmark.svelte";

    let { data } = $props();
    let showFolderPicker = $state(false);

    let showNewFolderModal = $state(false);
    let newFolderName = $state("");
    let showErrInNewFolderModal = $state(false);
    let errInNewFolderModalMsg = $state("");

    let folderToRename = null;
    let showFolderRenamingFlag = $state(false);
    function showFolderRenaming(folderId) {
        folderIdToRename = folderId;
        showFolderRenamingFlag = true;
    }

    let studysetListComponent;
    let studysetListData = $state({
        authed: data.authed,
        studysetList: data.studysetList,
        myFolders: data.myFolders,
        mySavedStudysets: data.mySavedStudysets
    })
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
        {#if data.authed}
        <button class="alt" onclick={() => showNewFolderModal = true}>
            <FolderIcon></FolderIcon>
            New Folder
        </button>
        {/if}
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
        data={studysetListData}
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
    <div class="modal" transition:fade={{duration: 200}}>
        <div class="content">
            <p>Create New Folder:</p>
            <input type="text" placeholder="Folder Name" style="margin-top: 0.4rem;" bind:value={newFolderName}>
            <div class="flex">
                <button onclick={async () => {
                    try {
                        const raw = await fetch(
                            "/api/graphql",
                            {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({
                                    query: `mutation ($name: String!) {
    createFolder(name: $name) {
        id
    }
}`,
                                    variables: {
                                        name: newFolderName
                                    }
                                })
                            }
                        )
                        const resp = await raw.json();
                        if (resp?.data?.createFolder) {
                            studysetListData.myFolders = [
                                ...(studysetListData?.myFolders ?? []),
                                {
                                    id: resp.data.createFolder?.id,
                                    name: newFolderName
                                }
                            ];
                            showNewFolderModal = false
                            showErrInNewFolderModal = false;
                        } else {
                            console.log(
                                "unsuccessful response when creating folder: ",
                                resp
                            );
                            errInNewFolderModalMsg = "Error creating folder :(";
                            showErrInNewFolderModal = true;
                        }
                    } catch (err) {
                        console.log("error creating folder: ", err);
                        errInNewFolderModalMsg = "Error creating folder :(";
                        showErrInNewFolderModal = true;
                    }
                    newFolderName = "";
                }}>
                    <CheckmarkIcon></CheckmarkIcon> Create
                </button>
                <button class="alt" onclick={() => {
                    showNewFolderModal = false;
                    showErrInNewFolderModal = false;
                }}>
                    Cancel
                </button>
            </div>
            {#if showErrInNewFolderModal}
            <div class="box ohno" transition:slide={{duration:400}}>
                <p>{errInNewFolderModalMsg}</p>
            </div>
            {/if}
        </div>
    </div>
{/if}
