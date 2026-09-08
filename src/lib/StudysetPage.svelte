<script>
    import Noscript from "$lib/components/Noscript.svelte";
    import { onMount } from "svelte";
    import { idbApiLayer } from "$lib/idb-api-layer";
    import { goto } from "$app/navigation";
    import { fade, slide } from "svelte/transition";
    import { studysetSelection } from "$lib/studyset-selection.svelte.js";
    let { data } = $props();

    import TermsTable from "$lib/components/TermsTable.svelte";
    import Flashcards from "$lib/components/Flashcards.svelte";
    import Dropdown from "$lib/components/Dropdown.svelte";
    import FolderPicker from "$lib/components/FolderPicker.svelte";

    import IconLocal from "$lib/icons/Local.svelte";
    import IconPencil from "$lib/icons/Pencil.svelte";
    import IconEyeSlash from "$lib/icons/EyeSlash.svelte";
    import IconTrash from "$lib/icons/Trash.svelte";
    import IconMoreDotsV from "$lib/icons/MoreDotsVertical.svelte";
    import IconReviewModeBook from "$lib/icons/ReviewModeBook.svelte";
    import IconPracticeTestChecklist from "$lib/icons/PracticeTestChecklist.svelte";
    import SRSIcon from "$lib/icons/FlaskScienceSRS.svelte";
    import IconGraph from "$lib/icons/ChartGraphLine.svelte";
    import IconFlashcards from "$lib/icons/Flashcards.svelte";
    import IconSettingsGear from "$lib/icons/SettingsGear.svelte";
    import GroupIcon from "$lib/icons/GroupUsers.svelte";
    import BookmarkIcon from "$lib/icons/Bookmark.svelte";
    import FolderIcon from "$lib/icons/Folder.svelte";
    import AngleRIcon from "$lib/icons/AngleRight.svelte";
    import FullscreenIcon from "$lib/icons/FullscreenMaximize.svelte";
    import GridIcon from "$lib/icons/AppsGrid.svelte";
    import PlusIcon from "$lib/icons/Plus.svelte";
    import XMarkIcon from "$lib/icons/CloseXMark.svelte";

    import { footerState } from "$lib/components/footer.svelte.js";

    var showDeleteConfirmationModal = $state(false);
    let title = $state(data?.studyset?.title);
    let terms = $state(data?.studyset?.terms);

    let mounted = $state(false);
    onMount(function () {
        mounted = true;
        let objectUrls = [];
        if (data.local) {
            (async () => {
                const localStudyset = await idbApiLayer.getStudysetById(
                    data.localId,
                    {
                        terms: {
                            progress: true,
                            termImageUrl: true,
                            defImageUrl: true
                        },
                    },
                );
                title = localStudyset?.title;
                terms = localStudyset?.terms;
                terms.forEach(term => {
                    if (term.termImageUrl != null) {
                        objectUrls.push(term.termImageUrl);
                    }
                    if (term.defImageUrl != null) {
                        objectUrls.push(term.defImageUrl);
                    }
                })
            })();
        }

        /* return cleanup function to cleanup object urls */
        return () => {
            objectUrls.forEach(objectUrl => URL.revokeObjectURL(objectUrl));
        };
    });
    async function deleteConfirmButtonClicked() {
        if (data.local) {
            await idbApiLayer.deleteStudyset(data.localId);
            goto("/dashboard");
        } else {
            try {
                const raw = await fetch("/api/graphql", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        query: `mutation DeleteStudyset($id: ID!) {
        deleteStudyset(id: $id)
    }`,
                        variables: {
                            id: data.studyset.id,
                        },
                    }),
                });
                const resp = await raw.json();
                if (resp?.data?.deleteStudyset == null) {
                    console.log("deleteStudyset graphql resp:", resp);
                    alert("GraphQL error while trying to delete studyset");
                } else {
                    goto("/dashboard");
                }
            } catch (err) {
                console.error(err);
                alert("Network error while deleting studyset");
            }
        }
    }

    let saved = $state(data?.studyset?.saved ?? false);
    let folderId = $state(data?.studyset?.myFolder?.id ?? null);
    let folderName = $state(data?.studyset?.myFolder?.name ?? null);
    let showFolderChooser = $state(false);
</script>

<svelte:head>
    {#if title}
        <title>{title} | Quizfreely</title>
        <meta property="og:title" content="{title} | Quizfreely" />
    {:else}
        <title>Quizfreely</title>
        <meta property="og:title" content="Quizfreely" />
    {/if}
    <meta name="robots" content="noindex, follow" />
    <meta name="description" content="Study with free flashcards, practice tests, and review activities on Quizfreely." />
    <meta name="og:description" content="Study with free flashcards, practice tests, and review activities on Quizfreely." />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Quizfreely" />
</svelte:head>

{#snippet folderPickerErrMsg()}
    <div class="box ohno" transition:slide={{ duration: 400 }}>
        <p>Error adding to/changing folder :(</p>
    </div>
{/snippet}

{#if data.local}
    <Noscript />
{/if}

{#snippet addToFolder()}
    <button class="alt" onclick={() => (showFolderChooser = true)}>
        <FolderIcon></FolderIcon>
        {folderId != null ? "Change Folder" : "Add to Folder"}
    </button>
{/snippet}
{#snippet multiselect()}
    {#if studysetSelection.show}
        {#if studysetSelection.cloudIds.has(data.studyset?.id ?? data.localId) || studysetSelection.localIds.has(data.studyset?.id ?? data.localId)}
            <button class="alt text fg1 with-badge" style="--badge-color: var(--warn);" onclick={() => {
                studysetSelection.deselect({
                    cloudId: data.studyset?.id,
                    localId: data.localId,
                });
            }}>
                <XMarkIcon /> Deselect
            </button>
        {:else}
            <button class="alt with-badge" style="--badge-color: var(--warn);" onclick={() => {
                studysetSelection.select({
                    cloudId: data.studyset?.id,
                    localId: data.localId,
                });
            }}>
                <PlusIcon /> Select
            </button>
        {/if}
    {:else}
        <a class="button alt" href={data.local ?
            `/combine?localStudyset=${data.localId}` :
            `/combine?studyset=${data.studyset?.id}`
        }><PlusIcon /> Select Multiple</a>
    {/if}
{/snippet}
<main>
    <div class="grid page">
        <div class="content">
                <div>
                    {#if folderName != null}
                        <div
                            class="flex compact-gap"
                            style="align-items: center;"
                        >
                            <!-- <a href="/dashboard" class="button faint">Folders</a> -->
                            <span class="fg0" style="padding: 0.6rem 1rem;">My Folders</span>
                            <AngleRIcon class="text fg0"></AngleRIcon>
                            <a
                                href="/folder/{folderId}"
                                class="button faint"
                            >
                                <FolderIcon></FolderIcon>
                                {folderName}
                            </a>
                        </div>
                    {/if}
                    <h2
                        class="caption"
                        style="overflow-wrap: anywhere; margin-top: 0.4rem;"
                    >
                        {title ?? "Title"}
                    </h2>
                    {#if data.local}
                        <div class="flex text fg0" style="align-items: center; gap: 0.4rem;">
                            <IconLocal /> Local Studyset
                        </div>
                    {:else if data?.studyset?.private}
                        <div class="flex text fg0" style="align-items: center; gap: 0.4rem;">
                            <IconEyeSlash /> Private Studyset
                        </div>
                    {:else if data?.studyset?.user?.displayName != null}
                        <p>
                            Created by <a href="/users/{data.studyset.user.id}"
                                >{data.studyset.user.displayName}</a
                            >
                        </p>
                    {/if}
                    {#if data.studyset && data.authed && data.authedUser.id == data.studyset.user?.id}
                        <div
                            id="edit-menu"
                            class="flex"
                            style="align-items: center;"
                        >
                            <a
                                href="/studyset/edit/{data.studyset.id}"
                                class="button"
                            >
                                <IconPencil />
                                Edit
                            </a>
                            {@render addToFolder()}
                            {@render multiselect()}
                            <Dropdown
                                button={{
                                    class: "dropdown-toggle",
                                    "aria-label": "More Options Dropdown",
                                }}
                            >
                                {#snippet buttonContent()}
                                    <IconMoreDotsV />
                                {/snippet}
                                {#snippet divContent()}
                                    <button
                                        class="ohno"
                                        id="delete-button"
                                        onclick={() => {
                                            showDeleteConfirmationModal = true;
                                        }}
                                        ><IconTrash /> Delete
                                    </button>
                                {/snippet}
                            </Dropdown>
                        </div>
                    {:else if data.local}
                        <div id="edit-menu" class="flex" style="align-items: center;">
                            <a
                                href="/studyset/local/edit?id={data.localId}"
                                class="button"
                            >
                                <IconPencil />
                                Edit
                            </a>
                            {@render multiselect()}
                            <Dropdown
                                button={{
                                    class: "dropdown-toggle",
                                    "aria-label": "More Options Dropdown",
                                }}
                            >
                                {#snippet buttonContent()}
                                    <IconMoreDotsV />
                                {/snippet}
                                {#snippet divContent()}
                                    <button
                                        class="ohno"
                                        id="delete-button"
                                        onclick={() => {
                                            showDeleteConfirmationModal = true;
                                        }}
                                        ><IconTrash /> Delete
                                    </button>
                                {/snippet}
                            </Dropdown>
                        </div>
                    {:else if data.authed}
                        <div id="edit-menu" class="flex" style="align-items: center;">
                            {#if saved}
                                <button
                                    class="alt"
                                    onclick={async () => {
                                        try {
                                            const respRaw = await fetch(
                                                "/api/graphql",
                                                {
                                                    method: "POST",
                                                    headers: {
                                                        "Content-Type":
                                                            "application/json",
                                                    },
                                                    body: JSON.stringify({
                                                        query: `mutation unsaveStudyset($id: ID!) {
    unsaveStudyset(studysetId: $id)
}`,
                                                        variables: {
                                                            id: data?.studyset
                                                                ?.id,
                                                        },
                                                    }),
                                                },
                                            );
                                            const resp = await respRaw.json();
                                            if (resp?.data?.unsaveStudyset) {
                                                saved = false;
                                            } else {
                                                console.error(
                                                    "idk, this happened: ",
                                                    resp,
                                                );
                                            }
                                        } catch (err) {
                                            console.error(
                                                "idk, this errored: ",
                                                err,
                                            );
                                        }
                                    }}
                                >
                                    <BookmarkIcon />
                                    Unsave
                                </button>
                            {:else}
                                <button
                                    class="alt"
                                    onclick={async () => {
                                        try {
                                            const respRaw = await fetch(
                                                "/api/graphql",
                                                {
                                                    method: "POST",
                                                    headers: {
                                                        "Content-Type":
                                                            "application/json",
                                                    },
                                                    body: JSON.stringify({
                                                        query: `mutation saveStudyset($id: ID!) {
    saveStudyset(studysetId: $id)
}`,
                                                        variables: {
                                                            id: data?.studyset
                                                                ?.id,
                                                        },
                                                    }),
                                                },
                                            );
                                            const resp = await respRaw.json();
                                            if (resp?.data?.saveStudyset) {
                                                saved = true;
                                            } else {
                                                console.error(
                                                    "idk, this happened: ",
                                                    resp,
                                                );
                                            }
                                        } catch (err) {
                                            console.error(
                                                "idk, this errored: ",
                                                err,
                                            );
                                        }
                                    }}
                                >
                                    <BookmarkIcon />
                                    Save
                                </button>
                            {/if}
                            {@render addToFolder()}
                            {@render multiselect()}
                        </div>
                    {:else}
                        <div class="flex" style="align-items: center;">
                            {@render multiselect()}
                        </div>
                    {/if}
                </div>
            {#snippet flashcardsCaptionEnd()}
                <a href="{data.local ? `/flashcards?localStudyset=${data.localId}` : `/flashcards?studyset=${data.studyset.id}`}" class="button faint" aria-label="Fullscreen Flashcards">
                    <FullscreenIcon></FullscreenIcon>
                </a>
            {/snippet}
            <Flashcards {terms} captionEnd={flashcardsCaptionEnd} />
                <div id="terms-and-stuff-outer-div" style="--qzfr-og-fg-1: var(--fg-1);">
                    <div class="caption grid list" style="--fg-1: var(--main);">
                        <a
                            class="button button-box flex qzfr-activity-button-box"
                            href="{data.local ? `/flashcards?localStudyset=${data.localId}` : `/flashcards?studyset=${data.studyset.id}`}"
                        >
                            <IconFlashcards />
                            Flashcards
                        </a>
                        <!-- <a href="/studyset/local/review-mode?id={ data.localId }" class="button alt"> -->
                        <!--   <IconReviewModeBook /> -->
                        <!--   Review Mode -->
                        <!-- </a> -->
                        <a
                            href="{data.local ? `/studyset/local/match?id=${data.localId}` : `/studysets/${data.studyset?.id}/match`}"
                            class="button button-box flex qzfr-activity-button-box"
                        >
                            <GridIcon />
                            Match
                        </a>
                        <a
                            href="{data.local ? `/studyset/local/practice-test?id=${data.localId}` : `/studysets/${data.studyset?.id}/practice-test`}"
                            class="button button-box flex qzfr-activity-button-box"
                        >
                            <IconPracticeTestChecklist />
                            Practice Test
                        </a>
                        <a
                            href={data.local ? `/spaced-repetition?localStudyset=${data.localId}` : `/spaced-repetition?studyset=${data.studyset?.id}`}
                            class="button button-box flex qzfr-activity-button-box"
                        >
                            <SRSIcon />
                            Spaced Repetition
                        </a>
    <!-- temporary placeholder, same as `multiselect` snippet without --warn badge
    will be replaced with "gravity" mode or similar -->
    <!-- {#if studysetSelection.show} -->
    <!--     {#if studysetSelection.cloudIds.has(data.studyset?.id ?? data.localId) || studysetSelection.localIds.has(data.studyset?.id ?? data.localId)} -->
    <!--         <button class="button-box flex qzfr-activity-button-box text fg1" onclick={() => { -->
    <!--             studysetSelection.deselect({ -->
    <!--                 cloudId: data.studyset?.id, -->
    <!--                 localId: data.localId, -->
    <!--             }); -->
    <!--         }}> -->
    <!--             <XMarkIcon /> Deselect -->
    <!--         </button> -->
    <!--     {:else} -->
    <!--         <button class="button-box flex qzfr-activity-button-box" onclick={() => { -->
    <!--             studysetSelection.select({ -->
    <!--                 cloudId: data.studyset?.id, -->
    <!--                 localId: data.localId, -->
    <!--             }); -->
    <!--         }}> -->
    <!--             <PlusIcon /> Select -->
    <!--         </button> -->
    <!--     {/if} -->
    <!-- {:else} -->
    <!--     <a class="button button-box flex qzfr-activity-button-box" href={data.local ? -->
    <!--         `/combine?localStudyset=${data.localId}` : -->
    <!--         `/combine?studyset=${data.studyset?.id}` -->
    <!--     }><PlusIcon /> Select Multiple</a> -->
    <!-- {/if} -->
                        <a
                            href="{data.local ? `/studyset/local/stats?id=${data.localId}` : `/studysets/${data.studyset?.id}/stats`}"
                            class="button button-box flex qzfr-activity-button-box"
                        >
                            <IconGraph />
                            Progress &amp; Stats
                        </a>
                    </div>
                    <TermsTable {terms} class="caption" />
                </div>
                {#if showDeleteConfirmationModal}
                    <div class="modal" transition:fade={{ duration: 200 }}>
                        <div class="content">
                            <p>
                                Are you sure you want to delete this studyset?
                            </p>
                            <div class="flex">
                                <button
                                    class="ohno"
                                    onclick={deleteConfirmButtonClicked}
                                >
                                    <IconTrash />
                                    Delete
                                </button>
                                <button
                                    class="alt"
                                    onclick={function () {
                                        showDeleteConfirmationModal = false;
                                    }}>Cancel</button
                                >
                            </div>
                        </div>
                    </div>
                {/if}
                {#if showFolderChooser}
                    <FolderPicker
                        closeCallback={() => (showFolderChooser = false)}
                        errMsg={folderPickerErrMsg}
                        selectCallback={async (
                            selectedFolder,
                            showErrorMsgCallback,
                        ) => {
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
                                            studysetId: data.studyset.id,
                                            folderId: selectedFolder.id,
                                        },
                                    }),
                                });
                                const resp = await raw.json();
                                if (resp?.data?.setStudysetFolder) {
                                    folderId = selectedFolder.id;
                                    folderName = selectedFolder.name;
                                    showFolderChooser = false;
                                } else {
                                    console.error(
                                        "Unsuccessful json response: ",
                                        resp,
                                    );
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
                                            studysetId: data.studyset.id,
                                        },
                                    }),
                                });
                                const resp = await raw.json();
                                if (resp?.data?.removeStudysetFromFolder) {
                                    folderId = null;
                                    folderName = null;
                                    showFolderChooser = false;
                                } else {
                                    console.error(
                                        "Unsuccessful json response: ",
                                        resp,
                                    );
                                    showErrorMsgCallback(true);
                                }
                            } catch (err) {
                                console.error(
                                    "Error removing from folder: ",
                                    err,
                                );
                                showErrorMsgCallback(true);
                            }
                        }}
                    ></FolderPicker>
                {/if}
<!-- TODO: WORK IN PROGRESS export terms -->
<!--            {#if showExportModal}
                <div class="modal" transition:fade={{ duration: 200 }}>
                    <div class="content">
                        <div class="grid import-terms-split">
                            <div>
                                <p>Between term & definition</p>
                                <div
                                    class="flex compact-gap nowrap"
                                    style="flex-direction: column; align-items: start; align-content: start;"
                                >
                                    <div
                                        class="flex compact-gap nowrap"
                                        style="flex-direction: column; align-content: start;"
                                    >
                                        <button
                                            class="button-box {exportTermDefDelimiterRadioSelect ==
                                            'tab'
                                                ? 'selected'
                                                : ''}"
                                            onclick={() =>
                                                (exportTermDefDelimiterRadioSelect =
                                                    "tab")}
                                        >
                                            <IconCheckmark
                                                class="button-box-selected-icon"
                                            ></IconCheckmark>
                                            Tab
                                        </button>
                                        <button
                                            class="button-box {exportTermDefDelimiterRadioSelect ==
                                            'comma'
                                                ? 'selected'
                                                : ''}"
                                            onclick={() =>
                                                (exportTermDefDelimiterRadioSelect =
                                                    "comma")}
                                        >
                                            <IconCheckmark
                                                class="button-box-selected-icon"
                                            ></IconCheckmark>
                                            Comma
                                        </button>
                                        <button
                                            class="button-box {exportTermDefDelimiterRadioSelect ==
                                            'custom'
                                                ? 'selected'
                                                : ''}"
                                            onclick={() =>
                                                (exportTermDefDelimiterRadioSelect =
                                                    "custom")}
                                        >
                                            <IconCheckmark
                                                class="button-box-selected-icon"
                                            ></IconCheckmark>
                                            Custom
                                        </button>
                                    </div>
                                </div>
                                {#if exportTermDefDelimiterRadioSelect == "custom"}
                                    <input
                                        type="text"
                                        placeholder="Term Delimiter"
                                        id="export-custom-termdef-delimiter-input"
                                        class="slightly-smaller-textbox"
                                        transition:scale={{ duration: 400 }}
                                    />
                                {/if}
                            </div>
                            <div>
                                <p>Between rows</p>
                                <div
                                    class="flex compact-gap nowrap"
                                    style="flex-direction: column; align-items: start; align-content: start;"
                                >
                                    <div
                                        class="flex compact-gap nowrap"
                                        style="flex-direction: column; align-content: start;"
                                    >
                                        <button
                                            class="button-box {exportRowDelimiterRadioSelect ==
                                            'newline'
                                                ? 'selected'
                                                : ''}"
                                            onclick={() =>
                                                (exportRowDelimiterRadioSelect =
                                                    "newline")}
                                        >
                                            <IconCheckmark
                                                class="button-box-selected-icon"
                                            ></IconCheckmark>
                                            New line
                                        </button>
                                        <button
                                            class="button-box {exportRowDelimiterRadioSelect ==
                                            'semicolon'
                                                ? 'selected'
                                                : ''}"
                                            onclick={() =>
                                                (exportRowDelimiterRadioSelect =
                                                    "semicolon")}
                                        >
                                            <IconCheckmark
                                                class="button-box-selected-icon"
                                            ></IconCheckmark>
                                            Semicolon
                                        </button>
                                        <button
                                            class="button-box {exportRowDelimiterRadioSelect ==
                                            'custom'
                                                ? 'selected'
                                                : ''}"
                                            onclick={() =>
                                                (exportRowDelimiterRadioSelect =
                                                    "custom")}
                                        >
                                            <IconCheckmark
                                                class="button-box-selected-icon"
                                            ></IconCheckmark>
                                            Custom
                                        </button>
                                    </div>
                                </div>
                                {#if exportRowDelimiterRadioSelect == "custom"}
                                    <input
                                        type="text"
                                        placeholder="Row Delimiter"
                                        id="export-custom-row-delimiter-input"
                                        class="slightly-smaller-textbox"
                                        transition:scale={{ duration: 400 }}
                                    />
                                {/if}
                            </div>
                        </div>
                        <textarea
                            id="export-textarea"
                            class="vertical"
                            rows="3"
                            placeholder="Press the export button, then copy terms here"
                        ></textarea>
                        <div class="flex">
                            <button
                                onclick={function () {
                                    var termDefDelimiter;
                                    var rowDelimiter;
                                    if (
                                        exportTermDefDelimiterRadioSelect ==
                                        "tab"
                                    ) {
                                        termDefDelimiter = "\t";
                                    } else if (
                                        exportTermDefDelimiterRadioSelect ==
                                        "comma"
                                    ) {
                                        termDefDelimiter = ",";
                                    } else if (
                                        exportTermDefDelimiterRadioSelect ==
                                        "custom"
                                    ) {
                                        termDefDelimiter = exportCustomTermDefDelimiter;
                                        if (termDefDelimiter == "") {
                                            alert(
                                                "Custom delimiter can't be blank >:(",
                                            );
                                            return;
                                        }
                                    }
                                    if (
                                        exportRowDelimiterRadioSelect ==
                                        "newline"
                                    ) {
                                        rowDelimiter = "\n";
                                    } else if (
                                        exportRowDelimiterRadioSelect ==
                                        "semicolon"
                                    ) {
                                        rowDelimiter = ";";
                                    } else if (
                                        exportRowDelimiterRadioSelect ==
                                        "custom"
                                    ) {
                                        rowDelimiter = exportCustomRowDelimiter;
                                        if (rowDelimiter == "") {
                                            alert(
                                                "Custom delimiter can't be blank >:(",
                                            );
                                            return;
                                        }
                                    }


                                    var pastedData = document.getElementById(
                                        "import-terms-paste-textarea",
                                    ).value;
                                    const terms2dArray = [];
                                    terms.forEach(term => {
                                        terms2dArray.push()
                                    })
                                    addTermsFrom2DArray(
                                        pastedData
                                            .split(rowDelimiter)
                                            .map((row) =>
                                                row
                                                    ? row.split(
                                                          termDefDelimiter,
                                                      )
                                                    : ["", ""],
                                            ),
                                    );

                                    /* after importing, if there was a delimiter at the end, it will create a blank last term,
                      check the last term and remove it if it's blank */
                                    if (
                                        terms[terms.length - 1].term === "" &&
                                        terms[terms.length - 1].def === ""
                                    ) {
                                        terms.splice(terms.length - 1, 1);
                                    }

                                    unsavedChanges = true;

                                    /* hide the modal after importing */
                                    showImportTermsModal = false;
                                }}>Import</button
                            >
                            <button
                                class="alt"
                                onclick={function () {
                                    showImportTermsModal = false;
                                }}>Cancel</button
                            >
                        </div>
                    </div>
                </div>
            {/if} -->
        </div>
    </div>
</main>
<style>
    .qzfr-activity-button-box,
    .flex.qzfr-activity-button-box,
    .button-box.qzfr-activity-button-box,
    .button-box.flex.qzfr-activity-button-box {
        display: flex;
        gap: 0.4rem;
        align-items: center;
    }
</style>
