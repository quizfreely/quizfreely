<script lang="ts">
    import { tick, onMount } from "svelte";
    import { slide, fade } from "svelte/transition";
    import { goto, pushState } from "$app/navigation";
    import { getClientSdk } from "$lib/graphql/sdk";
    import { idbApiLayer } from "$lib/idb-api-layer/index.js";
    import Dropdown from "$lib/components/Dropdown.svelte";
    import Noscript from "$lib/components/Noscript.svelte";
    import StudysetList from "$lib/components/StudysetList.svelte";
    import FolderPicker from "$lib/components/FolderPicker.svelte";
    import IconPlus from "$lib/icons/Plus.svelte";
    import FolderIcon from "$lib/icons/Folder.svelte";
    import BookmarkIcon from "$lib/icons/Bookmark.svelte";
    import PencilIcon from "$lib/icons/Pencil.svelte";
    import CheckmarkIcon from "$lib/icons/Checkmark.svelte";
    import TrashIcon from "$lib/icons/Trash.svelte";
    import MoreIcon from "$lib/icons/MoreDotsVertical.svelte";

    let { data }: { data: App.PageData & { folderId?: string, studysetListPageInfo: any, myFoldersPageInfo: any, mySavedStudysetsPageInfo: any, studysetList: any, myFolders: any, mySavedStudysets: any } } = $props();
    let showFolderPicker = $state(false);
    let folderPickerStudysetId: string | undefined = $state();

    let lastKeydown: string | null = $state(null);
    let ignoreEnterOnceNewFolder = false;
    let ignoreEnterOnceRenameFolder = false;

    let showNewFolderModal = $state(false);
    let newFolderName = $state("");
    let showErrInNewFolderModal = $state(false);
    let errInNewFolderModalMsg = $state("");
    let newFolderInput: HTMLInputElement | null = $state(null);
    function openNewFolderModal() {
        showNewFolderModal = true;
        showErrInNewFolderModal = false;
        newFolderName = "";

        /* if enter was used on the button to open the modal, prevent immideatly submitting & closing the modal with the same enter key press */
        ignoreEnterOnceNewFolder = lastKeydown == "Enter";

        tick().then(() => newFolderInput?.focus());
    }
    function hideNewFolderModal() {
        showNewFolderModal = false;
        showErrInNewFolderModal = false;
        newFolderName = "";
    }

    let folderRenaming: any = $state();
    let folderRenamingName = $state("");
    let folderRenamingInput: HTMLInputElement | null = $state(null);
    let showFolderRenamingFlag = $state(false);
    function showFolderRenaming(folder: any) {
        folderRenaming = folder;
        folderRenamingName = folder?.name ?? "";
        showFolderRenamingFlag = true;

        /* if enter was used on the button to open the modal, prevent immideatly submitting & closing the modal with the same enter key press */
        ignoreEnterOnceRenameFolder = lastKeydown == "Enter";

        tick().then(() => folderRenamingInput?.focus());
    }
    function hideFolderRenaming() {
        showFolderRenamingFlag = false;
        showFolderRenamingErr = false;
    }
    let showFolderRenamingErr = $state(false);
    let folderRenamingErrMsg = $state("");

    let studysetListComponent: any = $state();
    let studysetListData = $state({
        authed: data.authed,
        studysetList: data.studysetList,
        studysetListPageInfo: data.studysetListPageInfo,
        myFolders: data.myFolders,
        myFoldersPageInfo: data.myFoldersPageInfo,
        mySavedStudysets: data.mySavedStudysets,
        mySavedStudysetsPageInfo: data.mySavedStudysetsPageInfo,
    });

    let showDeleteFolderModal = $state(false);
    let deleteFolderId: string | null = $state(null);
    let deleteFolderName: string | null = $state(null);
    let showDeleteFolderErr = $state(false);
    let deleteFolderErrMsg = $state("");
    function showDeleteFolderConfirmation(folder: any) {
        showDeleteFolderModal = true;
        deleteFolderId = folder?.id;
        deleteFolderName = folder?.name;
    }
    function hideDeleteFolderConfirmation() {
        showDeleteFolderModal = false;
        showDeleteFolderErr = false;
    }
    
    const sdk = getClientSdk();

    async function newStudysetButton(folderId?: string) {
        if (data.authed) {
            const res = await sdk.CreateStudysetDraft({ folderId });
            goto(`/studyset/edit/${res?.createStudyset?.id}`)
        } else {
            const id = await idbApiLayer.createStudyset({
                title: "",
                draft: true
            });
            goto(`/studyset/local/edit?id=${id}`)
        }
    }
    async function newFolderOnclick() {
        try {
            const resp = await sdk.CreateFolder({ name: newFolderName });
            if (resp?.createFolder) {
                studysetListData.myFolders = [
                    ...(studysetListData?.myFolders ?? []),
                    {
                        id: resp.createFolder?.id,
                        name: newFolderName,
                    },
                ];
                showNewFolderModal = false;
                showErrInNewFolderModal = false;
            } else {
                console.log(
                    "unsuccessful response when creating folder: ",
                    resp,
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
    }

    async function renameFolderOnclick() {
        try {
            const resp = await sdk.RenameFolder({
                id: folderRenaming.id,
                name: folderRenamingName,
            });
            if (resp?.renameFolder) {
                /* update og obj from studysetlist component folder view */
                folderRenaming.name = folderRenamingName;

                /* update array from studysetlist component main view */
                const renamedIndex = studysetListData.myFolders.findIndex(
                    (folder: any) => folderRenaming.id == folder?.id,
                );
                if (renamedIndex >= 0) {
                    studysetListData.myFolders[renamedIndex].name = folderRenamingName;
                }
                showFolderRenamingFlag = false;
                showFolderRenamingErr = false;
            } else {
                console.log(
                    "unsuccessful response when renaming folder: ",
                    resp,
                );
                folderRenamingErrMsg = "Error renaming folder :(";
                showFolderRenamingErr = true;
            }
        } catch (err) {
            console.log("error renaming folder: ", err);
            folderRenamingErrMsg = "Error renaming folder :(";
            showFolderRenamingErr = true;
        }
    }
    function onKeyup(e: KeyboardEvent) {
        if (e.key === "Escape") {
            hideNewFolderModal();
            hideFolderRenaming();
            hideDeleteFolderConfirmation();
        }
    }
    function onKeydown(e: KeyboardEvent) {
        lastKeydown = e.key;
    }
    function windowOnclick() {
        lastKeydown = null;
    }
    onMount(() => {
        if (data?.folderId != null) {
            studysetListComponent.viewFolder(data?.folderId);
        }

        window.addEventListener("keyup", onKeyup);
        window.addEventListener("keydown", onKeydown);
        window.addEventListener("click", windowOnclick);
        return () => {
            window.removeEventListener("keyup", onKeyup);
            window.removeEventListener("keydown", onKeydown);
            window.removeEventListener("click", windowOnclick);
        };
    });
</script>

<svelte:head>
    <title>Quizfreely</title>
</svelte:head>

<Noscript />
<div>
    {#if !data.authed}
        <p id="dashboard-noaccount-alert" class="fg0">
            You're not signed in, so your sets will be saved locally (on your
            device)
        </p>
    {/if}
    {#snippet topMenu()}
        <div class="flex">
            <button onclick={() => newStudysetButton()}>
                <IconPlus />
                New Studyset
            </button>
            {#if data.authed}
                <button class="alt" onclick={() => openNewFolderModal()}>
                    <FolderIcon></FolderIcon>
                    New Folder
                </button>
            {/if}
        </div>
    {/snippet}
    {#snippet folderMenu(folder: any)}
        <div class="flex" style="align-items: center;">
            <button onclick={() => newStudysetButton(folder?.id)}>
                <IconPlus />
                New Studyset
            </button>
            <button class="alt" onclick={() => showFolderRenaming(folder)}>
                <PencilIcon />
                Rename Folder
            </button>
            <Dropdown
                button={{ class: "dropdown-toggle" }}
                placement="bottom-end"
            >
                {#snippet buttonContent()}
                    <MoreIcon></MoreIcon>
                {/snippet}
                {#snippet divContent()}
                    <button
                        class="ohno"
                        onclick={() => showDeleteFolderConfirmation(folder)}
                    >
                        <TrashIcon></TrashIcon> Delete Folder
                    </button>
                {/snippet}
            </Dropdown>
        </div>
    {/snippet}

    {#snippet emptyMsg()}
        <div class="box flex center-h center-v">
            <p class="fg0">Select "New Studyset" to enter or import terms</p>
        </div>
    {/snippet}
    {#snippet cloudDropdownContent(studyset: any)}
        <button
            onclick={() => {
                folderPickerStudysetId = studyset?.id;
                showFolderPicker = true;
            }}
        >
            <FolderIcon></FolderIcon>
            {studyset?.folder != null ? "Change Folder" : "Add to Folder"}
        </button>
    {/snippet}
    {#snippet savedDropdownContent(studyset: any)}
        <button
            onclick={() => {
                folderPickerStudysetId = studyset?.id;
                showFolderPicker = true;
            }}
        >
            <FolderIcon></FolderIcon>
            {studyset?.folder != null ? "Change Folder" : "Add to Folder"}
        </button>
        <button
            onclick={async () => {
                try {
                    const json = await sdk.UnsaveStudyset({ id: studyset?.id });
                    if (json?.unsaveStudyset) {
                        const index =
                            studysetListData?.mySavedStudysets?.findIndex(
                                (s: any) => s?.id == studyset?.id,
                            );
                        if (index >= 0) {
                            studysetListData?.mySavedStudysets?.splice(
                                index,
                                1,
                            );
                        }
                    } else {
                        console.log("failed to unsave studyset: ", json);
                    }
                } catch (err) {
                    console.log("error unsaving studyset: ", err);
                }
            }}
        >
            <BookmarkIcon></BookmarkIcon> Unsave
        </button>
    {/snippet}
    <StudysetList
        bind:this={studysetListComponent}
        data={studysetListData}
        cloudLinkTemplateFunc={(id: string) => `/studysets/${id}`}
        localLinkTemplateFunc={(id: number | string) => `/studyset/local?id=${id}`}
        cloudEmptyMsg={emptyMsg}
        localEmptyMsg={emptyMsg}
        collapseCloud={true}
        collapseLocal={true}
        collapseSaved={true}
        showCloudDropdown={true}
        {cloudDropdownContent}
        showLocalDropdown={false}
        localDropdownContent={() => {}}
        showSavedDropdown={true}
        {savedDropdownContent}
        {topMenu}
        {folderMenu}
        onFolderEnter={(folder: {id:string}) => {
            pushState(`/dashboard?folder=${folder.id}`, {});
        }}
        onFolderExit={() => {
            pushState("/dashboard", {});
        }}
    ></StudysetList>
</div>
{#if showNewFolderModal}
    <div class="modal" transition:fade={{ duration: 200 }}>
        <div class="content" style="min-width: 0px;">
            <p>Create New Folder:</p>
            <input
                type="text"
                placeholder="Folder Name"
                style="margin-top: 0.4rem;"
                bind:value={newFolderName}
                bind:this={newFolderInput}
                onkeyup={(e) => {
                    if (e.key == "Enter") {
                        if (ignoreEnterOnceNewFolder) {
                            ignoreEnterOnceNewFolder = false;
                            return;
                        }
                        newFolderOnclick();
                    }
                }}
            />
            <div class="flex">
                <button onclick={newFolderOnclick}>
                    <CheckmarkIcon></CheckmarkIcon> Create
                </button>
                <button class="alt" onclick={hideNewFolderModal}>
                    Cancel
                </button>
            </div>
            {#if showErrInNewFolderModal}
                <div class="box ohno" transition:slide={{ duration: 400 }}>
                    <p>{errInNewFolderModalMsg}</p>
                </div>
            {/if}
        </div>
    </div>
{/if}
{#if showFolderRenamingFlag}
    <div class="modal" transition:fade={{ duration: 200 }}>
        <div class="content" style="min-width: 0px;">
            <p>Rename Folder:</p>
            <input
                type="text"
                placeholder="New Folder Name"
                style="margin-top: 0.4rem;"
                bind:value={folderRenamingName}
                bind:this={folderRenamingInput}
                onkeyup={(e) => {
                    if (e.key == "Enter") {
                        if (ignoreEnterOnceRenameFolder) {
                            ignoreEnterOnceRenameFolder = false;
                            return;
                        }
                        renameFolderOnclick();
                    }
                }}
            />
            <div class="flex">
                <button onclick={renameFolderOnclick}>
                    <CheckmarkIcon></CheckmarkIcon> Rename
                </button>
                <button class="alt" onclick={hideFolderRenaming}>
                    Cancel
                </button>
            </div>
            {#if showFolderRenamingErr}
                <div class="box ohno" transition:slide={{ duration: 400 }}>
                    <p>{folderRenamingErrMsg}</p>
                </div>
            {/if}
        </div>
    </div>
{/if}
{#if showDeleteFolderModal}
    <div class="modal" transition:fade={{ duration: 200 }}>
        <div class="content">
            <p>Are you sure you want to delete this folder?</p>
            <div class="box">
                <div
                    class="flex"
                    style="align-items: center; flex-wrap: nowrap;"
                >
                    <FolderIcon></FolderIcon>
                    {deleteFolderName}
                </div>
            </div>
            <div class="flex">
                <button
                    class="ohno"
                    onclick={async () => {
                        try {
                            const resp = await sdk.DeleteFolder({
                                id: deleteFolderId ?? "",
                            });
                            if (resp?.deleteFolder) {
                                window.location.reload();
                            } else {
                                console.log(
                                    "unsuccessful response when deleting folder: ",
                                    resp,
                                );
                                deleteFolderErrMsg = "Error deleting folder :(";
                                showDeleteFolderErr = true;
                            }
                        } catch (err) {
                            console.log("error deleting folder: ", err);
                            deleteFolderErrMsg = "Error deleting folder :(";
                            showDeleteFolderErr = true;
                        }
                    }}
                >
                    <TrashIcon></TrashIcon> Delete
                </button>
                <button
                    class="alt"
                    onclick={() => {
                        showDeleteFolderModal = false;
                        showDeleteFolderErr = false;
                    }}
                >
                    Cancel
                </button>
            </div>
            {#if showDeleteFolderErr}
                <div class="box ohno" transition:slide={{ duration: 400 }}>
                    <p>{deleteFolderErrMsg}</p>
                </div>
            {/if}
        </div>
    </div>
{/if}
{#snippet folderPickerErrMsg()}
    <div class="box ohno" transition:slide={{ duration: 400 }}>
        <p>Error adding to/changing folder :(</p>
    </div>
{/snippet}
{#if showFolderPicker}
    <FolderPicker
        closeCallback={() => (showFolderPicker = false)}
        errMsg={folderPickerErrMsg}
        selectCallback={async (selectedFolder, showErrorMsgCallback) => {
            showErrorMsgCallback(false);
            try {
                const resp = await sdk.SetStudysetFolder({
                    studysetId: folderPickerStudysetId ?? "",
                    folderId: selectedFolder.id,
                });
                if (resp?.setStudysetFolder) {
                    const studysetListIndex =
                        studysetListData.studysetList?.findIndex(
                            (studyset: any) =>
                                folderPickerStudysetId == studyset?.id,
                        );
                    if (studysetListIndex >= 0) {
                        studysetListData.studysetList.splice(
                            studysetListIndex,
                            1,
                        );
                    }
                    const folderData = studysetListComponent.getFolderData();
                    if (folderData && folderData?.id != selectedFolder?.id) {
                        const index = folderData?.studysets?.findIndex(
                            (studyset: any) =>
                                folderPickerStudysetId == studyset?.id,
                        );
                        if (index >= 0) {
                            folderData.studysets.splice(index, 1);
                        }
                    }
                    showFolderPicker = false;
                } else {
                    console.error("Unsuccessful response: ", resp);
                    showErrorMsgCallback(true);
                }
            } catch (err) {
                console.error("Error adding to folder: ", err);
                showErrorMsgCallback(true);
            }
        }}
        showNoneOption={true}
        noneCallback={async (showErrorMsgCallback) => {
            showErrorMsgCallback(false);
            try {
                const resp = await sdk.RemoveStudysetFromFolder({
                    studysetId: folderPickerStudysetId ?? "",
                });
                if (resp?.removeStudysetFromFolder) {
                    const folderData = studysetListComponent.getFolderData();
                    if (folderData) {
                        const index = folderData?.studysets?.findIndex(
                            (studyset: any) =>
                                folderPickerStudysetId == studyset?.id,
                        );
                        if (index >= 0) {
                            const deleted = folderData.studysets.splice(
                                index,
                                1,
                            );
                            studysetListData?.studysetList?.unshift(deleted[0]);
                        }
                    }
                    showFolderPicker = false;
                } else {
                    console.error("Unsuccessful response: ", resp);
                    showErrorMsgCallback(true);
                }
            } catch (err) {
                console.error("Error removing from folder: ", err);
                showErrorMsgCallback(true);
            }
        }}
    ></FolderPicker>
{/if}
