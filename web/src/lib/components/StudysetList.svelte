<script>
    import { fancyTimestamp } from "$lib/fancyTimestamp";
    import db from "$lib/idb-api-layer/db.js";
    import idbApiLayer from "$lib/idb-api-layer/idb-api-layer.js";
    import { onMount } from "svelte";
    import { slide, fade, scale } from "svelte/transition";
    import { sineIn, sineOut } from "svelte/easing";
    import StudysetLinkBox from "$lib/components/StudysetLinkBox.svelte";
    import MoreIcon from "$lib/icons/MoreDotsVertical.svelte";
    import LocalIcon from "$lib/icons/Local.svelte";
    import BookmarkIcon from "$lib/icons/Bookmark.svelte";
    import FolderIcon from "$lib/icons/Folder.svelte";
    import BackIcon from "$lib/icons/BackArrow.svelte";
    import ArrowLeftIcon from "$lib/icons/ArrowLeft.svelte";
    import ArrowRightIcon from "$lib/icons/ArrowRight.svelte";

    let {
        data,
        cloudLinkTemplateFunc,
        localLinkTemplateFunc,
        cloudEmptyMsg,
        localEmptyMsg,
        hideTypeWhenCloudEmptyAndLocalExists = false,
        collapseCloud = true,
        collapseLocal = true,
        collapseSaved = true,
        showCloudDropdown = false,
        cloudDropdownContent,
        showLocalDropdown = false,
        localDropdownContent,
        showSavedDropdown = false,
        savedDropdownContent,
        topMenu,
        folderMenu,
    } = $props();

    let localStudysetList = $state([]);

    let cloudCurrentlyCollapsed = $state(true);
    let localCurrentlyCollapsed = $state(true);
    let savedCurrentlyCollapsed = $state(true);

    onMount(async function () {
        localStudysetList = await db.studysets.orderBy("updatedAt").toArray();
        for (const studyset of localStudysetList) {
            studyset.termsCount =
                (await idbApiLayer.getTermsByStudysetId(studyset.id))?.length ??
                0;
        }
    });

    const COLLAPSE_LENGTH = 6;
    const EXPANDED_PER_PAGE = 24;

    let cloudPage = $state(0);
    let localPage = $state(0);
    let savedPage = $state(0);

    let inFolder = $state(false);
    let currentFolder = $state(null);
    let folderPage = $state(0);
    let folderPageInfo = $state(null);
    let showErrorBox = $state(false);
    let errorBoxText = $state("");

    async function loadPage(type, direction) {
        let cursor = null;
        let query = "";
        let variables = {};

        if (type === "cloud") {
            cursor =
                direction === "next"
                    ? data.studysetListPageInfo?.endCursor
                    : data.studysetListPageInfo?.startCursor;
            query = `query ($first: Int, $after: String, $last: Int, $before: String) {
                myStudysets(first: $first, after: $after, last: $last, before: $before, hideFoldered: true) {
                    edges { node { id title private termsCount updatedAt folder { id name } } }
                    pageInfo { hasNextPage hasPreviousPage startCursor endCursor }
                }
            }`;
        } else if (type === "folder") {
            cursor =
                direction === "next"
                    ? folderPageInfo?.endCursor
                    : folderPageInfo?.startCursor;

            // Note: server loader for folder isn't updated to take vars, but we are querying via client side graphql here in loadPage
            // We need to use `folder(id: ...)` query but with pagination args on studysets field?
            // Actually the query structure is `folder(id: $id) { studysets(first:...) ... }`
            // So we need to pass folder ID too.
            // But `loadPage` generic structure doesn't easily support extra args unless we use state.

            // Re-using currentFolder.id
            query = `query ($id: ID!, $first: Int, $after: String, $last: Int, $before: String) {
                folder(id: $id) {
                    studysets(first: $first, after: $after, last: $last, before: $before) {
                        edges { node { id title private termsCount updatedAt folder { id name } } }
                        pageInfo { hasNextPage hasPreviousPage startCursor endCursor }
                    }
                }
            }`;
            variables.id = currentFolder?.id;
        } else if (type === "saved") {
            cursor =
                direction === "next"
                    ? data.mySavedStudysetsPageInfo?.endCursor
                    : data.mySavedStudysetsPageInfo?.startCursor;
            query = `query ($first: Int, $after: String, $last: Int, $before: String) {
                mySavedStudysets(first: $first, after: $after, last: $last, before: $before) {
                    edges { node { id title private termsCount updatedAt folder { id name } } }
                    pageInfo { hasNextPage hasPreviousPage startCursor endCursor }
                }
            }`;
        }

        if (direction === "next") {
            variables.first = EXPANDED_PER_PAGE;
            variables.after = cursor;
        } else {
            variables.last = EXPANDED_PER_PAGE;
            variables.before = cursor;
        }

        try {
            const respRaw = await fetch("/api/graphql", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query, variables }),
            });
            const resp = await respRaw.json();
            const connection =
                resp?.data?.myStudysets ?? resp?.data?.mySavedStudysets;

            if (connection) {
                if (type === "cloud") {
                    data.studysetList = connection.edges.map((e) => e.node);
                    data.studysetListPageInfo = connection.pageInfo;
                    cloudPage += direction === "next" ? 1 : -1;
                } else if (type === "saved") {
                    data.mySavedStudysets = connection.edges.map((e) => e.node);
                    data.mySavedStudysetsPageInfo = connection.pageInfo;
                    savedPage += direction === "next" ? 1 : -1;
                }
            } else if (type === "folder" && resp?.data?.folder?.studysets) {
                const connection = resp.data.folder.studysets;
                currentFolder.studysets = connection.edges.map((e) => e.node);
                folderPageInfo = connection.pageInfo;
                folderPage += direction === "next" ? 1 : -1;
            }
        } catch (err) {
            console.error("Error loading page:", err);
        }
    }

    const getPaginatedList = (list, isCollapsed, page) => {
        if (isCollapsed) {
            return list.slice(0, COLLAPSE_LENGTH);
        }
        return list.slice(
            page * EXPANDED_PER_PAGE,
            (page + 1) * EXPANDED_PER_PAGE,
        );
    };

    const hasNextPageFunc = (type) => {
        if (type === "cloud") {
            if (cloudCurrentlyCollapsed)
                return data.studysetList?.length > COLLAPSE_LENGTH;
            return data.studysetListPageInfo?.hasNextPage;
        }
        if (type === "folder") {
            return folderPageInfo?.hasNextPage;
        }
        if (type === "saved") {
            if (savedCurrentlyCollapsed)
                return data.mySavedStudysets?.length > COLLAPSE_LENGTH;
            return data.mySavedStudysetsPageInfo?.hasNextPage;
        }
        if (type === "local") {
            if (localCurrentlyCollapsed)
                return localStudysetList?.length > COLLAPSE_LENGTH;
            return (
                (localPage + 1) * EXPANDED_PER_PAGE < localStudysetList.length
            );
        }
        return false;
    };

    const hasPrevPageFunc = (type) => {
        if (type === "cloud") {
            if (cloudCurrentlyCollapsed) return false;
            return data.studysetListPageInfo?.hasPreviousPage;
        }
        if (type === "folder") {
            return folderPageInfo?.hasPreviousPage;
        }
        if (type === "saved") {
            if (savedCurrentlyCollapsed) return false;
            return data.mySavedStudysetsPageInfo?.hasPreviousPage;
        }
        if (type === "local") {
            if (localCurrentlyCollapsed) return false;
            return localPage > 0;
        }
        return false;
    };
    export async function viewFolder(id) {
        try {
            const respRaw = await fetch("/api/graphql", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    query: `query ($id: ID!){
    folder(id: $id) {
        id
        name
        studysets(first: 24) {
            edges {
                node {
                    id
                    title
                    termsCount
                    folder {
                        id
                        name
                    }
                }
            }
            pageInfo {
                hasNextPage
                hasPreviousPage
                startCursor
                endCursor
            }
        }
    }
}`,
                    variables: {
                        id,
                    },
                }),
            });
            const resp = await respRaw.json();
            if (resp?.data?.folder) {
                currentFolder = resp.data.folder;
                // Initialize studysets list from edges
                if (currentFolder.studysets && currentFolder.studysets.edges) {
                    folderPageInfo = currentFolder.studysets.pageInfo;
                    currentFolder.studysets = currentFolder.studysets.edges.map(
                        (e) => e.node,
                    );
                }
                showErrorBox = false;
                inFolder = true;
                folderPage = 0;
            } else {
                console.log(
                    "unsucessful response while loading folder: ",
                    resp,
                );
                errorBoxText = "Error loading folder :(";
                showErrorBox = true;
            }
        } catch (err) {
            console.error(err);
            errorBoxText = "Error loading folder :(";
            showErrorBox = true;
        }
    }

    export function exitFolderView() {
        inFolder = false;
    }

    export function getFolderData() {
        return inFolder ? currentFolder : null;
    }
</script>

{#key inFolder}
    <div
        in:fade={{ duration: 120, delay: 120, easing: sineIn }}
        out:fade={{ duration: 120, easing: sineOut }}
    >
        {#if showErrorBox}
            <div class="box ohno" transition:slide={{ duration: 400 }}>
                <p>{errorBoxText}</p>
            </div>
        {/if}
        {#if inFolder}
            <div class="flex">
                <button
                    class="faint"
                    onclick={() => {
                        inFolder = false;
                    }}
                >
                    <BackIcon></BackIcon> Back
                </button>
            </div>
            <p class="h4" style="margin-top: 1rem;">
                <FolderIcon></FolderIcon>
                {currentFolder?.name}
            </p>
            {@render folderMenu?.(currentFolder)}
            {#if currentFolder?.studysets?.length > 0}
                <div class="grid list" style="overflow-wrap: anywhere;">
                    {#each currentFolder.studysets as studyset}
                        <StudysetLinkBox
                            {studyset}
                            linkTemplateFunc={cloudLinkTemplateFunc}
                            showDropdown={showCloudDropdown}
                            dropdownContent={cloudDropdownContent}
                        ></StudysetLinkBox>
                    {/each}
                </div>
                {#if folderPageInfo?.hasNextPage || folderPageInfo?.hasPreviousPage}
                    <div
                        class="flex center"
                        style="width: 100%; margin-top: 0.6rem; flex-direction: column; align-items: center; gap: 0.8rem;"
                    >
                        <div
                            class={hasNextPageFunc("folder") &&
                            hasPrevPageFunc("folder")
                                ? "combo-buttons"
                                : ""}
                        >
                            {#if hasPrevPageFunc("folder")}
                                <button
                                    class="button alt {hasNextPageFunc('folder')
                                        ? 'left'
                                        : ''}"
                                    onclick={() => loadPage("folder", "prev")}
                                >
                                    <ArrowLeftIcon></ArrowLeftIcon> Previous
                                </button>
                            {/if}
                            {#if hasNextPageFunc("folder")}
                                <button
                                    class="button alt {hasPrevPageFunc('folder')
                                        ? 'right'
                                        : ''}"
                                    onclick={() => loadPage("folder", "next")}
                                >
                                    Next <ArrowRightIcon></ArrowRightIcon>
                                </button>
                            {/if}
                        </div>
                    </div>
                {/if}
            {:else}
                <div class="box">
                    <p class="fg0">This folder is empty</p>
                </div>
            {/if}
        {:else}
            {@render topMenu?.()}
            {#if data.myFolders?.length > 0}
                <div
                    class="grid list"
                    style="overflow-wrap: anywhere; margin-bottom: 1rem;"
                >
                    {#each data.myFolders as folder}
                        <button
                            class="button-box"
                            style="display: flex;"
                            onclick={() => viewFolder(folder.id)}
                            transition:scale={{ duration: 200 }}
                        >
                            <FolderIcon></FolderIcon>
                            {folder.name}
                        </button>
                    {/each}
                </div>
            {/if}
            {#if data.authed && !(hideTypeWhenCloudEmptyAndLocalExists && !(data.studysetList?.length > 0) && localStudysetList?.length > 0)}
                <div
                    class="grid list"
                    style="overflow-wrap: anywhere; {collapseCloud &&
                    data.studysetList?.length > COLLAPSE_LENGTH
                        ? 'margin-bottom: 0px;'
                        : ''}"
                >
                    {#if data.studysetList && data.studysetList.length > 0}
                        {#each cloudCurrentlyCollapsed ? data.studysetList.slice(0, COLLAPSE_LENGTH) : data.studysetList as studyset}
                            <StudysetLinkBox
                                {studyset}
                                linkTemplateFunc={cloudLinkTemplateFunc}
                                showDropdown={showCloudDropdown}
                                dropdownContent={cloudDropdownContent}
                            ></StudysetLinkBox>
                        {/each}
                    {:else}
                        {@render cloudEmptyMsg()}
                    {/if}
                </div>
                {#if (collapseCloud && data.studysetList?.length > COLLAPSE_LENGTH) || (!cloudCurrentlyCollapsed && (data.studysetListPageInfo?.hasNextPage || data.studysetListPageInfo?.hasPreviousPage))}
                    <div
                        class="flex center"
                        style="width: 100%; margin-top: 0.6rem; flex-direction: column; align-items: center; gap: 0.8rem;"
                    >
                        {#if !cloudCurrentlyCollapsed && (hasNextPageFunc("cloud") || hasPrevPageFunc("cloud"))}
                            <div
                                class={hasNextPageFunc("cloud") &&
                                hasPrevPageFunc("cloud")
                                    ? "combo-buttons"
                                    : ""}
                            >
                                {#if hasPrevPageFunc("cloud")}
                                    <button
                                        class="button alt {hasNextPageFunc(
                                            'cloud',
                                        )
                                            ? 'left'
                                            : ''}"
                                        onclick={() =>
                                            loadPage("cloud", "prev")}
                                    >
                                        <ArrowLeftIcon></ArrowLeftIcon> Previous
                                    </button>
                                {/if}
                                {#if hasNextPageFunc("cloud")}
                                    <button
                                        class="button alt {hasPrevPageFunc(
                                            'cloud',
                                        )
                                            ? 'right'
                                            : ''}"
                                        onclick={() =>
                                            loadPage("cloud", "next")}
                                    >
                                        Next <ArrowRightIcon></ArrowRightIcon>
                                    </button>
                                {/if}
                            </div>
                        {/if}
                        <button
                            class="faint"
                            onclick={() => {
                                cloudCurrentlyCollapsed =
                                    !cloudCurrentlyCollapsed;
                                cloudPage = 0;
                            }}
                        >
                            {cloudCurrentlyCollapsed ? "Show All" : "Collapse"}
                        </button>
                    </div>
                {/if}
            {/if}
            {#if data.authed && localStudysetList?.length > 0 && !(hideTypeWhenCloudEmptyAndLocalExists && !(data.studysetList?.length > 0) && localStudysetList?.length > 0)}
                <p class="h4" style="margin-top: 0.6rem;">
                    <LocalIcon></LocalIcon> Local Studysets
                </p>
            {/if}
            <div
                class="grid list"
                style="overflow-wrap: anywhere; {collapseLocal &&
                localStudysetList?.length > COLLAPSE_LENGTH
                    ? 'margin-bottom: 0px;'
                    : ''}"
            >
                {#each getPaginatedList(localStudysetList, localCurrentlyCollapsed, localPage) as studyset}
                    <StudysetLinkBox
                        {studyset}
                        linkTemplateFunc={localLinkTemplateFunc}
                        showDropdown={showLocalDropdown}
                        dropdownContent={localDropdownContent}
                    ></StudysetLinkBox>
                {/each}
                {#if !data.authed && localStudysetList.length == 0}
                    <!-- only show empty message here if user is logged out and therefore can only have local studysets -->
                    {@render localEmptyMsg()}
                {/if}
            </div>
            {#if (collapseLocal && localStudysetList?.length > COLLAPSE_LENGTH) || (!localCurrentlyCollapsed && localStudysetList?.length > EXPANDED_PER_PAGE)}
                <div
                    class="flex center"
                    style="width: 100%; margin-top: 0.6rem; flex-direction: column; align-items: center; gap: 0.8rem;"
                >
                    {#if !localCurrentlyCollapsed && (hasNextPageFunc("local") || hasPrevPageFunc("local"))}
                        <div
                            class={hasNextPageFunc("local") &&
                            hasPrevPageFunc("local")
                                ? "combo-buttons"
                                : ""}
                        >
                            {#if hasPrevPageFunc("local")}
                                <button
                                    class="button alt {hasNextPageFunc('local')
                                        ? 'left'
                                        : ''}"
                                    onclick={() => localPage--}
                                >
                                    <ArrowLeftIcon></ArrowLeftIcon> Previous
                                </button>
                            {/if}
                            {#if hasNextPageFunc("local")}
                                <button
                                    class="button alt {hasPrevPageFunc('local')
                                        ? 'right'
                                        : ''}"
                                    onclick={() => localPage++}
                                >
                                    Next <ArrowRightIcon></ArrowRightIcon>
                                </button>
                            {/if}
                        </div>
                    {/if}
                    <button
                        class="faint"
                        onclick={() => {
                            localCurrentlyCollapsed = !localCurrentlyCollapsed;
                            localPage = 0;
                        }}
                    >
                        {localCurrentlyCollapsed ? "Show All" : "Collapse"}
                    </button>
                </div>
            {/if}
            {#if data.mySavedStudysets?.length > 0}
                <p class="h4" style="margin-top: 0.6rem;">
                    <BookmarkIcon></BookmarkIcon> Saved Studysets
                </p>
                <div
                    class="grid list"
                    style="overflow-wrap: anywhere; {collapseSaved &&
                    data.mySavedStudysets?.length > COLLAPSE_LENGTH
                        ? 'margin-bottom: 0px;'
                        : ''}"
                >
                    {#each savedCurrentlyCollapsed ? data.mySavedStudysets.slice(0, COLLAPSE_LENGTH) : data.mySavedStudysets as studyset}
                        <StudysetLinkBox
                            {studyset}
                            linkTemplateFunc={cloudLinkTemplateFunc}
                            showDropdown={showSavedDropdown}
                            dropdownContent={savedDropdownContent}
                        ></StudysetLinkBox>
                    {/each}
                </div>
                {#if (collapseSaved && data.mySavedStudysets?.length > COLLAPSE_LENGTH) || (!savedCurrentlyCollapsed && (data.mySavedStudysetsPageInfo?.hasNextPage || data.mySavedStudysetsPageInfo?.hasPreviousPage))}
                    <div
                        class="flex center"
                        style="width: 100%; margin-top: 0.6rem; flex-direction: column; align-items: center; gap: 0.8rem;"
                    >
                        {#if !savedCurrentlyCollapsed && (hasNextPageFunc("saved") || hasPrevPageFunc("saved"))}
                            <div
                                class={hasNextPageFunc("saved") &&
                                hasPrevPageFunc("saved")
                                    ? "combo-buttons"
                                    : ""}
                            >
                                {#if hasPrevPageFunc("saved")}
                                    <button
                                        class="button alt {hasNextPageFunc(
                                            'saved',
                                        )
                                            ? 'left'
                                            : ''}"
                                        onclick={() =>
                                            loadPage("saved", "prev")}
                                    >
                                        <ArrowLeftIcon></ArrowLeftIcon> Previous
                                    </button>
                                {/if}
                                {#if hasNextPageFunc("saved")}
                                    <button
                                        class="button alt {hasPrevPageFunc(
                                            'saved',
                                        )
                                            ? 'right'
                                            : ''}"
                                        onclick={() =>
                                            loadPage("saved", "next")}
                                    >
                                        Next <ArrowRightIcon></ArrowRightIcon>
                                    </button>
                                {/if}
                            </div>
                        {/if}
                        <button
                            class="faint"
                            onclick={() => {
                                savedCurrentlyCollapsed =
                                    !savedCurrentlyCollapsed;
                                savedPage = 0;
                            }}
                        >
                            {savedCurrentlyCollapsed ? "Show All" : "Collapse"}
                        </button>
                    </div>
                {/if}
            {/if}
        {/if}
    </div>
{/key}
