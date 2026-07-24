<script>
    import { tick, onMount } from "svelte";
    import { slide, fade } from "svelte/transition";
    import { goto } from "$app/navigation";
    import { idbApiLayer } from "$lib/idb-api-layer/index.js";
    import Noscript from "$lib/components/Noscript.svelte";
    import StudysetList from "$lib/components/StudysetList.svelte";
    import FolderPicker from "$lib/components/FolderPicker.svelte";
    import IconPlus from "$lib/icons/Plus.svelte";
    import FolderIcon from "$lib/icons/Folder.svelte";
    import BookmarkIcon from "$lib/icons/Bookmark.svelte";
    import CheckmarkIcon from "$lib/icons/Checkmark.svelte";
    import EnterIcon from "$lib/icons/Enter.svelte";
    import ExitIcon from "$lib/icons/Exit.svelte";

    let { data } = $props();
    let showFolderPicker = $state(false);
    let folderPickerStudysetId;

    let lastKeydown = null;
    let ignoreEnterOnceNewFolder = false;
    let showNewFolderModal = $state(false);
    let newFolderName = $state("");
    let newFolderPrivate = $state(false);
    let showErrInNewFolderModal = $state(false);
    let errInNewFolderModalMsg = $state("");
    let newFolderInput = $state(null);
    function openNewFolderModal() {
        showNewFolderModal = true;
        showErrInNewFolderModal = false;
        newFolderName = "";
        newFolderPrivate = false;

        /* if enter was used on the button to open the modal, prevent immideatly submitting & closing the modal with the same enter key press */
        ignoreEnterOnceNewFolder = lastKeydown == "Enter";

        tick().then(() => newFolderInput?.focus());
    }
    function hideNewFolderModal() {
        showNewFolderModal = false;
        showErrInNewFolderModal = false;
        newFolderName = "";
        newFolderPrivate = false;
    }

    let studysetListData = $state({
        authed: data.authed,
        studysetList: data.studysetList,
        studysetListPageInfo: data.studysetListPageInfo,
        myFolders: data.myFolders,
        myFoldersPageInfo: data.myFoldersPageInfo,
        mySavedStudysets: data.mySavedStudysets,
        mySavedStudysetsPageInfo: data.mySavedStudysetsPageInfo,
    });

    async function newStudysetButton(folderId) {
        if (data.authed) {
            const raw = await fetch("/api/graphql", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    query: `mutation createStudysetDraft($folderId: ID) {
    createStudyset(
        studyset: {
            title: "",
            private: false
        },
        draft: true,
        folderId: $folderId
    ) {
        id
    }
}`,
                    variables: {
                        folderId
                    }
                })
            });
            const res = await raw.json();
            goto(`/studyset/edit/${res?.data?.createStudyset?.id}`)
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
            const raw = await fetch("/api/graphql", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    query: `mutation ($name: String!, $private: Boolean!) {
    createFolder(name: $name, private: $private) {
        id
    }
}`,
                    variables: {
                        name: newFolderName,
                        private: newFolderPrivate
                    },
                }),
            });
            const resp = await raw.json();
            if (resp?.data?.createFolder) {
                goto(`/folder/${resp.data.createFolder.id}`);
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
        newFolderPrivate = false;
    }

    function onKeyup(e) {
        if (e.key === "Escape") {
            hideNewFolderModal();
        }
    }
    function onKeydown(e) {
        lastKeydown = e.key;
    }
    function windowOnclick() {
        lastKeydown = null;
    }
    onMount(() => {
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
        <p class="fg0">
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
            <a href="/import" class="button alt">
                <EnterIcon></EnterIcon>
                Import
            </a>
            {#if data.authed}
                <button class="alt" onclick={() => openNewFolderModal()}>
                    <FolderIcon></FolderIcon>
                    New Folder
                </button>
            {/if}
        </div>
    {/snippet}
    {#snippet emptyMsg()}
        <div class="box flex center-h center-v">
            <p class="fg0">Select "New Studyset" to enter or import terms</p>
        </div>
    {/snippet}
    {#snippet cloudDropdownContent(studyset)}
        <button
            onclick={() => {
                folderPickerStudysetId = studyset?.id;
                showFolderPicker = true;
            }}
        >
            <FolderIcon></FolderIcon>
            {studyset?.myFolder != null ? "Change Folder" : "Add to Folder"}
        </button>
    {/snippet}
    {#snippet savedDropdownContent(studyset)}
        <button
            onclick={() => {
                folderPickerStudysetId = studyset?.id;
                showFolderPicker = true;
            }}
        >
            <FolderIcon></FolderIcon>
            {studyset?.myFolder != null ? "Change Folder" : "Add to Folder"}
        </button>
        <button
            onclick={async () => {
                try {
                    const raw = await fetch("/api/graphql", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            query: `mutation ($id: ID!) {
    unsaveStudyset(studysetId: $id)
}`,
                            variables: {
                                id: studyset?.id,
                            },
                        }),
                    });
                    const json = await raw.json();
                    if (json?.data?.unsaveStudyset) {
                        const index =
                            studysetListData?.mySavedStudysets?.findIndex(
                                (s) => s?.id == studyset?.id,
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
    ></StudysetList>
</div>
{#if showNewFolderModal}
    <div class="modal" transition:fade={{ duration: 200 }}>
        <div class="content" style="min-width: 0px;">
            <p class="fg0">Create New Folder:</p>
            <input
                type="text"
                placeholder="Folder Name"
                class="title-textbox"
                style="margin-top: 0.4rem; min-width: 18rem; max-width: 90vw;"
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
                <button class="button-box {newFolderPrivate ? "" : "selected"}" onclick={() => {
                    newFolderPrivate = false;
                }}>
                    <CheckmarkIcon class="button-box-selected-icon"></CheckmarkIcon>
                    Public
                </button>
                <button class="button-box {newFolderPrivate ? "selected" : ""}" onclick={() => {
                    newFolderPrivate = true;
                }}>
                    <CheckmarkIcon class="button-box-selected-icon"></CheckmarkIcon>
                    Private
                </button>
            </div>
            <div class="flex" style="margin-top: 2rem;">
                <button onclick={newFolderOnclick}>
                    Create
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
                const raw = await fetch(`/api/graphql`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        query: `mutation ($studysetId: ID!, $folderId: ID!) {
    setStudysetFolder(studysetId: $studysetId, folderId: $folderId)
}`,
                        variables: {
                            studysetId: folderPickerStudysetId,
                            folderId: selectedFolder.id,
                        },
                    }),
                });
                const resp = await raw.json();
                if (resp?.data?.setStudysetFolder) {
                    const studysetListIndex =
                        studysetListData.studysetList?.findIndex(
                            (studyset) =>
                                folderPickerStudysetId == studyset?.id,
                        );
                    if (studysetListIndex >= 0) {
                        studysetListData.studysetList.splice(
                            studysetListIndex,
                            1,
                        );
                    }
                    showFolderPicker = false;
                } else {
                    console.error("Unsuccessful json response: ", resp);
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
                const raw = await fetch(`/api/graphql`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        query: `mutation ($studysetId: ID!) {
    removeStudysetFromFolder(studysetId: $studysetId)
}`,
                        variables: {
                            studysetId: folderPickerStudysetId,
                        },
                    }),
                });
                const resp = await raw.json();
                if (resp?.data?.removeStudysetFromFolder) {
                    showFolderPicker = false;
                } else {
                    console.error("Unsuccessful json response: ", resp);
                    showErrorMsgCallback(true);
                }
            } catch (err) {
                console.error("Error removing from folder: ", err);
                showErrorMsgCallback(true);
            }
        }}
    ></FolderPicker>
{/if}
<style>
    .title-textbox,
    input.title-textbox,
    .title-textbox::placeholder,
    input.title-textbox::placeholder {
        font-size: 1.4rem;
    }
</style>
