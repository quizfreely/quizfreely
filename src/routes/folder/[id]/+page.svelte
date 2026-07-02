<script>
    import { tick, onMount } from "svelte";
    import { slide, fade, scale } from "svelte/transition";
    import { sineIn, sineOut } from "svelte/easing";
    import { goto } from "$app/navigation";
    import Dropdown from "$lib/components/Dropdown.svelte";
    import FolderPicker from "$lib/components/FolderPicker.svelte";
    import StudysetLinkBox from "$lib/components/StudysetLinkBox.svelte";
    import IconPlus from "$lib/icons/Plus.svelte";
    import FolderIcon from "$lib/icons/Folder.svelte";
    import BackIcon from "$lib/icons/BackArrow.svelte";
    import ArrowLeftIcon from "$lib/icons/ArrowLeft.svelte";
    import ArrowRightIcon from "$lib/icons/ArrowRight.svelte";
    import PencilIcon from "$lib/icons/Pencil.svelte";
    import TrashIcon from "$lib/icons/Trash.svelte";
    import CheckmarkIcon from "$lib/icons/Checkmark.svelte";
    import MoreIcon from "$lib/icons/MoreDotsVertical.svelte";

    let { data } = $props();

    let studysets = $state(data?.studysets ?? []);
    let pageInfo = $state(data?.pageInfo);
    let folder = $state(data?.folder);
    let folderPage = $state(0);
    let perPage = data?.PER_PAGE ?? 24;

    let showErrorBox = $state(false);
    let errorBoxText = $state("");

    let lastKeydown = null;
    let ignoreEnterOnceRenameFolder = false;

    let showFolderRenamingFlag = $state(false);
    let folderRenamingInput = $state(null);
    let folderRenamingName = $state("");
    let showFolderRenamingErr = $state(false);
    let folderRenamingErrMsg = $state("");

    let showDeleteFolderModal = $state(false);
    let showDeleteFolderErr = $state(false);
    let deleteFolderErrMsg = $state("");

    let showFolderPicker = $state(false);
    let folderPickerStudysetId;

    async function loadPage(direction) {
        let cursor = direction === "next"
            ? pageInfo?.endCursor
            : pageInfo?.startCursor;

        let variables = {
            id: folder.id,
            first: direction === "next" ? perPage : undefined,
            after: direction === "next" ? cursor : undefined,
            last: direction === "prev" ? perPage : undefined,
            before: direction === "prev" ? cursor : undefined,
        };

        try {
            const respRaw = await fetch("/api/graphql", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    query: `query ($id: ID!, $first: Int, $after: String, $last: Int, $before: String) {
                        folder(id: $id) {
                            studysets(first: $first, after: $after, last: $last, before: $before) {
                                edges { node { id title private termsCount updatedAt myFolder { id name } } }
                                pageInfo { hasNextPage hasPreviousPage startCursor endCursor }
                            }
                        }
                    }`,
                    variables,
                }),
            });
            const resp = await respRaw.json();
            if (resp?.data?.folder?.studysets) {
                const connection = resp.data.folder.studysets;
                studysets = connection.edges.map((e) => e.node);
                pageInfo = connection.pageInfo;
                folderPage += direction === "next" ? 1 : -1;
            }
        } catch (err) {
            console.error("Error loading page:", err);
            errorBoxText = "Error loading studysets :(";
            showErrorBox = true;
        }
    }

    let hasNextPage = $derived(pageInfo?.hasNextPage);
    let hasPrevPage = $derived(pageInfo?.hasPreviousPage);

    async function newStudysetButton() {
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
                        folderId: folder.id
                    }
                })
            });
            const res = await raw.json();
            goto(`/studyset/edit/${res?.data?.createStudyset?.id}`)
        }
    }

    async function renameFolderOnclick() {
        try {
            const raw = await fetch("/api/graphql", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    query: `mutation ($id: ID!, $name: String!) {
    updateFolder(id: $id, name: $name) {
        id
    }
}`,
                    variables: {
                        id: folder.id,
                        name: folderRenamingName,
                    },
                }),
            });
            const resp = await raw.json();
            if (resp?.data?.updateFolder) {
                folder.name = folderRenamingName;
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

    function showFolderRenaming() {
        folderRenamingName = folder?.name ?? "";
        showFolderRenamingFlag = true;

        ignoreEnterOnceRenameFolder = lastKeydown == "Enter";

        tick().then(() => folderRenamingInput?.focus());
    }

    function hideFolderRenaming() {
        showFolderRenamingFlag = false;
        showFolderRenamingErr = false;
    }

    function showDeleteFolderConfirmation() {
        showDeleteFolderModal = true;
    }

    function hideDeleteFolderConfirmation() {
        showDeleteFolderModal = false;
        showDeleteFolderErr = false;
    }

    async function deleteFolderOnclick() {
        try {
            const raw = await fetch("/api/graphql", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    query: `mutation ($id: ID!) {
    deleteFolder(id: $id)
}`,
                    variables: {
                        id: folder.id,
                    },
                }),
            });
            const resp = await raw.json();
            if (resp?.data?.deleteFolder) {
                goto("/dashboard");
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
    }

    function onKeyup(e) {
        if (e.key === "Escape") {
            hideFolderRenaming();
            hideDeleteFolderConfirmation();
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
    <title>{folder?.name ?? "Folder"} - Quizfreely</title>
</svelte:head>

{#snippet studysetDropdown(studyset, hideFunc)}
    <button
        onclick={() => {
            folderPickerStudysetId = studyset?.id;
            showFolderPicker = true;
            hideFunc?.();
        }}
    >
        <FolderIcon></FolderIcon>
        {studyset?.myFolder != null ? "Change Folder" : "Add to Folder"}
    </button>
{/snippet}

<div class="grid page">
    <div class="content">
    {#if showErrorBox}
        <div class="box ohno" transition:slide={{ duration: 400 }}>
            <p>{errorBoxText}</p>
        </div>
    {/if}
    <p class="h4" style="margin-top: 1rem;">
        <FolderIcon></FolderIcon>
        {folder?.name}
    </p>
    <div class="flex" style="align-items: center;">
        <button onclick={newStudysetButton}>
            <IconPlus />
            New Studyset
        </button>
        <button class="alt" onclick={showFolderRenaming}>
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
                    onclick={showDeleteFolderConfirmation}
                >
                    <TrashIcon></TrashIcon> Delete Folder
                </button>
            {/snippet}
        </Dropdown>
    </div>
    {#if studysets?.length > 0}
        <div class="grid list" style="overflow-wrap: anywhere;">
            {#each studysets as studyset}
                <StudysetLinkBox
                    {studyset}
                    linkTemplateFunc={(id) => `/studysets/${id}`}
                    showDropdown={true}
                    dropdownContent={studysetDropdown}
                ></StudysetLinkBox>
            {/each}
        </div>
        {#if hasNextPage || hasPrevPage}
            <div
                class={hasNextPage && hasPrevPage
                    ? "combo-buttons"
                    : ""}
            >
                {#if hasPrevPage}
                    <button
                        class="button alt {hasNextPage
                            ? 'left'
                            : ''}"
                        onclick={() => loadPage("prev")}
                    >
                        <ArrowLeftIcon></ArrowLeftIcon> Previous
                    </button>
                {/if}
                {#if hasNextPage}
                    <button
                        class="button alt {hasPrevPage
                            ? 'right'
                            : ''}"
                        onclick={() => loadPage("next")}
                    >
                        Next <ArrowRightIcon></ArrowRightIcon>
                    </button>
                {/if}
            </div>
        {/if}
    {:else}
        <div class="box">
            <p class="fg0">This folder is empty</p>
        </div>
    {/if}
    </div>
</div>

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
                    {folder?.name}
                </div>
            </div>
            <div class="flex">
                <button class="ohno" onclick={deleteFolderOnclick}>
                    <TrashIcon></TrashIcon> Delete
                </button>
                <button class="alt" onclick={hideDeleteFolderConfirmation}>
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
                    if (selectedFolder?.id != folder?.id) {
                        const index = studysets?.findIndex(
                            (s) => folderPickerStudysetId == s?.id,
                        );
                        if (index >= 0) {
                            studysets.splice(index, 1);
                        }
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
                    const index = studysets?.findIndex(
                        (s) => folderPickerStudysetId == s?.id,
                    );
                    if (index >= 0) {
                        studysets.splice(index, 1);
                    }
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
