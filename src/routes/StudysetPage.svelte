<script>
    import Noscript from "$lib/components/Noscript.svelte";
    import { onMount } from "svelte";
    import { idbApiLayer } from "$lib/idb-api-layer";
    import { goto } from "$app/navigation";
    import { fade, slide } from "svelte/transition";
    let { data } = $props();

    import Flashcards from "../lib/components/Flashcards.svelte";
    import Dropdown from "$lib/components/Dropdown.svelte";
    import FolderPicker from "$lib/components/FolderPicker.svelte";

    import IconLocal from "$lib/icons/Local.svelte";
    import IconPencil from "$lib/icons/Pencil.svelte";
    import IconEyeSlash from "$lib/icons/EyeSlash.svelte";
    import IconTrash from "$lib/icons/Trash.svelte";
    import IconMoreDotsV from "$lib/icons/MoreDotsVertical.svelte";
    import IconReviewModeBook from "$lib/icons/ReviewModeBook.svelte";
    import IconPracticeTestChecklist from "$lib/icons/PracticeTestChecklist.svelte";
    import IconGraph from "$lib/icons/ChartGraphLine.svelte";
    import IconFlashcards from "$lib/icons/Flashcards.svelte";
    import IconSettingsGear from "$lib/icons/SettingsGear.svelte";
    import GroupIcon from "$lib/icons/GroupUsers.svelte";
    import BookmarkIcon from "$lib/icons/Bookmark.svelte";
    import FolderIcon from "$lib/icons/Folder.svelte";
    import AngleRIcon from "$lib/icons/AngleRight.svelte";
    import FullscreenIcon from "$lib/icons/FullscreenMaximize.svelte";
    import GridIcon from "$lib/icons/AppsGrid.svelte";

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
            fetch("/api/graphql", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "same-origin",
                body: JSON.stringify({
                    query: `mutation DeleteStudyset($id: ID!) {
    deleteStudyset(id: $id)
}`,
                    variables: {
                        id: data.studyset.id,
                    },
                }),
            })
                .then((response) => response.json())
                .then((response) => {
                    if (response.errors) {
                        console.error(response.errors);
                        alert("GraphQL error: " + response.errors[0].message);
                    } else {
                        goto("/dashboard");
                    }
                })
                .catch((error) => {
                    console.error(error);
                    alert("Network error while deleting studyset");
                });
        }
    }

    let saved = $state(data?.studyset?.saved ?? false);
    let folderId = $state(data?.studyset?.folder?.id ?? null);
    let folderName = $state(data?.studyset?.folder?.name ?? null);
    let showFolderChooser = $state(false);
</script>

<svelte:head>
    {#if title}
        <title>{title} - Quizfreely</title>
        <meta property="og:title" content="{title} - Quizfreely" />
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
<main>
    <div class="grid page">
        <div class="content">
                <div>
                    {#if folderName}
                        <div
                            class="flex compact-gap"
                            style="align-items: center;"
                        >
                            <a href="/dashboard" class="button faint">Folders</a
                            >
                            <AngleRIcon class="text fg0"></AngleRIcon>
                            <a
                                href="/dashboard?folder={folderId}"
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
                        <p class="fg0">
                            <IconLocal /> Local Studyset
                        </p>
                    {:else if data?.studyset?.private}
                        <p class="fg0">
                            <IconEyeSlash /> Private Studyset
                        </p>
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
                        <div id="edit-menu" class="flex">
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
                        </div>
                    {/if}
                </div>
            {#snippet flashcardsCaptionEnd()}
                <a href="{data.local ? `/studyset/local/flashcards?id=${data.localId}` : `/studysets/${data.studyset.id}/flashcards`}" class="button faint" aria-label="Fullscreen Flashcards">
                    <FullscreenIcon></FullscreenIcon>
                </a>
            {/snippet}
            <Flashcards {terms} captionEnd={flashcardsCaptionEnd} />
                <div id="terms-and-stuff-outer-div">
                    <div class="caption grid list">
                        <!-- <a -->
                        <!--     id="flashcards-maximize" -->
                        <!--     class="button alt" -->
                        <!--     href="{data.local ? -->
                        <!--         `/studyset/local/flashcards?id=${data.localId}` : -->
                        <!--         `/studysets/${data.studyset.id}/flashcards` -->
                        <!--     }" -->
                        <!-- > -->
                        <!--     <IconFlashcards /> -->
                        <!--     Flashcards -->
                        <!-- </a> -->
                        <!-- <a href="/studyset/local/review-mode?id={ data.localId }" class="button alt"> -->
                        <!--   <IconReviewModeBook /> -->
                        <!--   Review Mode -->
                        <!-- </a> -->
                        <a
                            href="{data.local ? `/studyset/local/match?id=${data.localId}` : `/studysets/${data.studyset?.id}/match`}"
                            class="button alt"
                        >
                            <GridIcon />
                            Match
                        </a>
                        <a
                            href="{data.local ? `/studyset/local/practice-test?id=${data.localId}` : `/studysets/${data.studyset?.id}/practice-test`}"
                            class="button alt"
                        >
                            <IconPracticeTestChecklist />
                            Practice Test
                        </a>
                        <a
                            href="{data.local ? `/studyset/local/stats?id=${data.localId}` : `/studysets/${data.studyset?.id}/stats`}"
                            class="button alt"
                        >
                            <IconGraph />
                            Progress &amp; Stats
                        </a>
                    </div>

                    <table class="outer caption box">
                        <tbody>
                            <tr>
                                <th>Term</th>
                                <th>Definition</th>
                            </tr>
                            {#if terms != null}
                                {#each terms as term}
                                    <tr>
                                        <td style="vertical-align: top; padding: 0px;">
                                            <div style="white-space: pre-wrap; padding-left: 1rem; padding-right: 1rem; padding-top: 1rem; padding-bottom: 0px;">{term.term}</div>
                                            {#if term?.termImageUrl != null}
                                                <div><img src={term.termImageUrl} alt="term image" class="term-image"></div>
                                            {/if}
                                        </td>
                                        <td style="vertical-align: top; padding: 0px;">
                                            <div style="white-space: pre-wrap; padding-left: 1rem; padding-right: 1rem; padding-top: 1rem; padding-bottom: 0px;">{term.def}</div>
                                            {#if term?.defImageUrl != null}
                                                <div style="padding-left: 0.6rem;"><img src={term.defImageUrl} alt="definition image" class="term-image"></div>
                                            {/if}
                                        </td>
                                    </tr>
                                {/each}
                            {/if}
                        </tbody>
                    </table>
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
    .term-image {
        max-width: 18.6rem;
        max-height: 300px;
        margin: 0px;
        padding: 0px;
        border-radius: 0.8rem;
    }
</style>
