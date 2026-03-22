<script lang="ts">
    import Noscript from "$lib/components/Noscript.svelte";
    import { onMount } from "svelte";
    import { idbApiLayer } from "$lib/idb-api-layer";
    import { getClientSdk } from "$lib/graphql/sdk";
    import { goto, beforeNavigate } from "$app/navigation";
    import { fade, slide } from "svelte/transition";
    let { data }: { data: any } = $props();

    import Dropdown from "$lib/components/Dropdown.svelte";
    import FolderPicker from "$lib/components/FolderPicker.svelte";

    import IconLocal from "$lib/icons/Local.svelte";
    import IconPencil from "$lib/icons/Pencil.svelte";
    import IconEyeSlash from "$lib/icons/EyeSlash.svelte";
    import IconTrash from "$lib/icons/Trash.svelte";
    import IconBackArrow from "$lib/icons/BackArrow.svelte";
    import IconArrowLeft from "$lib/icons/ArrowLeft.svelte";
    import IconArrowRight from "$lib/icons/ArrowRight.svelte";
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

    import { Confetti } from "svelte-confetti";
    import { footerState } from "$lib/components/footer.svelte.js";

    var showDeleteConfirmationModal = $state(false);
    let title = $state(data?.studyset?.title);
    let terms = $state(data?.studyset?.terms);
    let flashcardsIndex = $state(0);

    /* use a set to track seen flashcards
    so flipping same card does not add a new element
    so we can use the length/size to check how many cards have been seen (both sides) this session */
    let flashcardsSeenWhileMax = $state(new Set());
    let showConfetti = $state(false);

    function flashcardsFlip() {
        document.getElementById("flashcard")?.classList.toggle("flip");
        if (flashcardsMaximized) {
            flashcardsSeenWhileMax.add(flashcardsIndex);
        }
    }
    function flashcardsPrev() {
        if (flashcardsIndex > 0) {
            flashcardsIndex -= 1;
        }
    }
    function flashcardsNext() {
        if (flashcardsIndex < terms?.length - 1) {
            flashcardsIndex += 1;
        }

        if (
            flashcardsMaximized == true &&
            terms?.length > 4 &&
            flashcardsIndex == terms?.length - 1 &&
            flashcardsSeenWhileMax.size == terms?.length - 1
        ) {
            showConfetti = true;
        }
    }

    let mounted = $state(false);
    onMount(function () {
        mounted = true;
        let objectUrls: string[] = [];
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
                terms = localStudyset?.terms ?? [];
                terms.forEach((term: any) => {
                    if (term.termImageUrl != null) {
                        objectUrls.push(term.termImageUrl);
                    }
                    if (term.defImageUrl != null) {
                        objectUrls.push(term.defImageUrl);
                    }
                })
            })();
        }

        function flashcardsOnKeyDown(e: KeyboardEvent) {
            const active = document.activeElement;
            if (
                active &&
                (active.tagName === "INPUT" ||
                    active.tagName === "TEXTAREA" ||
                    (active as HTMLElement).isContentEditable)
            ) {
                return;
            }

            switch (e.key) {
                case "ArrowLeft":
                case "h":
                case "j":
                    flashcardsPrev();
                    break;
                case "ArrowRight":
                case "l":
                case "k":
                    flashcardsNext();
                    break;
                case " " /* space */:
                    /* prevent scrolling,
                    but don't flip here in keydown,
                    to avoid spam-flipping */
                    e.preventDefault();

                /* next/prev is in keydown to allow spamming to move quickly,
                flip is in keyup to prevent spam reflipping */
            }
        }
        function flashcardsOnKeyUp(e: KeyboardEvent) {
            const active = document.activeElement;
            if (
                active &&
                (active.tagName === "INPUT" ||
                    active.tagName === "TEXTAREA" ||
                    (active as HTMLElement).isContentEditable)
            ) {
                return;
            }

            if (e.key == " ") {
                /* flip in keyup to only flip once */
                e.preventDefault();
                flashcardsFlip();
            }
        }

        window.addEventListener("keydown", flashcardsOnKeyDown);
        window.addEventListener("keyup", flashcardsOnKeyUp);

        /* return cleanup function to remove eventlisteners & cleanup object urls */
        return () => {
            window.removeEventListener("keydown", flashcardsOnKeyDown);
            window.removeEventListener("keyup", flashcardsOnKeyUp);
            objectUrls.forEach(objectUrl => URL.revokeObjectURL(objectUrl));
        };
    });
    const sdk = getClientSdk();
    async function deleteConfirmButtonClicked() {
        if (data.local) {
            await idbApiLayer.deleteStudyset(data.localId);
            goto("/dashboard");
        } else {
            sdk.DeleteStudyset({ id: data.studyset.id })
                .then((response) => {
                    if (response.deleteStudyset) {
                        goto("/dashboard");
                    }
                })
                .catch((error) => {
                    console.error(error);
                    alert("Network error while deleting studyset");
                });
        }
    }

    let flashcardsMaximized = $state(false);
    function maximizeFlashcards() {
        flashcardsMaximized = true;
        footerState.hideFooter = true;
    }
    function unmaximizeFlashcards() {
        flashcardsMaximized = false;
        footerState.hideFooter = false;
    }

    beforeNavigate(() => {
        footerState.hideFooter = false;
    });

    let saved = $state(data?.studyset?.saved ?? false);
    let folderId = $state(data?.studyset?.folder?.id ?? null);
    let folderName = $state(data?.studyset?.folder?.name ?? null);
    let showFolderChooser = $state(false);
</script>

<svelte:head>
    {#if title}
        <title>{title} - Quizfreely</title>
    {:else}
        <title>Quizfreely</title>
    {/if}
    {#if !data.local && data?.studyset?.seoIndexingApproved}
        <meta name="robots" content="index, follow" />
    {:else}
        <meta name="robots" content="noindex, follow" />
    {/if}
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
            {#if !flashcardsMaximized}
                <div id="title-and-menu-outer-div">
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
                    {#if data.studyset && data.authed && data.authedUser!.id == data.studyset.user?.id}
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
                        <div id="edit-menu" class="flex">
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
                                            const resp = await sdk.UnsaveStudyset({
                                                id: data?.studyset?.id,
                                            });
                                            if (resp?.unsaveStudyset) {
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
                                            const resp = await sdk.SaveStudyset({
                                                id: data?.studyset?.id,
                                            });
                                            if (resp?.saveStudyset) {
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
            {/if}
            <div id="flashcards-outer-div">
                {#if flashcardsMaximized}
                    <div class="flex">
                        <button
                            id="flashcards-unmaximize"
                            class="faint"
                            onclick={unmaximizeFlashcards}
                        >
                            <IconBackArrow /> Back
                        </button>
                    </div>
                {/if}
                <div>
                    <!-- There is a seperate flip button further below that's keyboard accessible and does the same thing as clicking the flashcard to flip -->
                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                    <div
                        class="card double"
                        id="flashcard"
                        onclick={flashcardsFlip}
                        role="presentation"
                    >
                        <div class="content">
                            <div
                                class="front"
                                id="flashcard-front"
                            >
                                <div>
                                <div style="white-space:pre-wrap">{terms?.[flashcardsIndex]?.term ?? "term"}</div>
                                {#if terms?.[flashcardsIndex]?.termImageUrl != null}
                                <div><img src={terms[flashcardsIndex].termImageUrl} alt="term image" class="flashcard-term-image"></div>
                                {/if}
                                </div>
                            </div>
                            <div
                                class="back"
                                id="flashcard-back"
                            >
                                <div>
                                <div style="white-space:pre-wrap">{terms?.[flashcardsIndex]?.def ?? "definition"}</div>
                                {#if terms?.[flashcardsIndex]?.defImageUrl != null}
                                <div><img src={terms[flashcardsIndex].defImageUrl} alt="definition image" class="flashcard-term-image"></div>
                                {/if}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="caption">
                        <div
                            class="progress-bar thin yay"
                            style="margin-left: 0.4rem; margin-right: 0.4rem;"
                        >
                            <div
                                style="width: {terms != null
                                    ? ((flashcardsIndex + 1) / terms?.length) *
                                      100
                                    : '20'}%"
                            ></div>
                        </div>
                    </div>
                    <div class="caption centerThree">
                        <p id="flashcards-count">
                            {flashcardsIndex + 1}/{terms?.length ?? "?"}
                        </p>
                        <div class="flex justifyselfcenter compact-gap">
                            <button
                                id="flashcards-prev-button"
                                class="faint"
                                aria-label="Previous Card"
                                onclick={flashcardsPrev}
                            >
                                <IconArrowLeft />
                            </button>
                            <button
                                id="flashcards-flip-button"
                                class="faint"
                                onclick={flashcardsFlip}>Flip</button
                            >
                            <button
                                id="flashcards-next-button"
                                class="faint"
                                aria-label="Next Card"
                                onclick={flashcardsNext}
                            >
                                <IconArrowRight />
                            </button>
                        </div>
                        <div class="flex end">
                            <!--<button id="flashcards-maximize-button">
                <i class="nf nf-md-fullscreen"></i>
              </button>
              <button id="flashcards-unmaximize-button" class="hide">
                <i class="nf nf-md-fullscreen_exit"></i>
              </button>-->
                        </div>
                    </div>
                </div>
            </div>
            {#if !flashcardsMaximized}
                <div id="terms-and-stuff-outer-div">
                    <div class="caption grid list">
                        <button
                            id="flashcards-maximize"
                            class="alt"
                            onclick={maximizeFlashcards}
                        >
                            <IconFlashcards />
                            Flashcards
                        </button>
                        {#if data.local}
                            <!-- <a href="/studyset/local/review-mode?id={ data.localId }" class="button alt"> -->
                            <!--   <IconReviewModeBook /> -->
                            <!--   Review Mode -->
                            <!-- </a> -->
                            <a
                                href="/studyset/local/practice-test?id={data.localId}"
                                class="button alt"
                            >
                                <IconPracticeTestChecklist />
                                Practice Test
                            </a>
                            <a
                                href="/studyset/local/stats?id={data.localId}"
                                class="button alt"
                            >
                                <IconGraph />
                                Progress &amp; Stats
                            </a>
                        {:else if data.studyset}
                            <!-- <a href="/studysets/{ data.studyset.id }/review-mode" class="button alt"> -->
                            <!--   <IconReviewModeBook /> -->
                            <!--   Review Mode -->
                            <!-- </a> -->
                            <a
                                href="/studysets/{data.studyset
                                    .id}/practice-test"
                                class="button alt"
                            >
                                <IconPracticeTestChecklist />
                                Practice Test
                            </a>
                            <a
                                href="/studysets/{data.studyset.id}/stats"
                                class="button alt"
                            >
                                <IconGraph />
                                Progress &amp; Stats
                            </a>
                        {/if}
                    </div>

                    <table class="outer caption box" id="terms-table">
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
                            selectedFolder: any,
                            showErrorMsgCallback: (show: boolean) => void,
                        ) => {
                            showErrorMsgCallback(false);
                            try {
                                const resp = await sdk.SetStudysetFolder({
                                    studysetId: data.studyset.id,
                                    folderId: selectedFolder.id,
                                });
                                if (resp?.setStudysetFolder) {
                                    folderId = selectedFolder.id;
                                    folderName = selectedFolder.name;
                                    showFolderChooser = false;
                                } else {
                                    console.error(
                                        "Unsuccessful response: ",
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
                        noneCallback={async (showErrorMsgCallback: (show: boolean) => void) => {
                            showErrorMsgCallback(false);
                            try {
                                const resp = await sdk.RemoveStudysetFromFolder({
                                    studysetId: data.studyset.id,
                                });
                                if (resp?.removeStudysetFromFolder) {
                                    folderId = null;
                                    folderName = null;
                                    showFolderChooser = false;
                                } else {
                                    console.error(
                                        "Unsuccessful response: ",
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
            {/if}
        </div>
    </div>
</main>
{#if showConfetti}
    <!-- fullscreen confetti -->
    <div
        style="position: fixed; top: -50px; left 0px; margin-top: 0px; height: 100vh; width: 100vw; display: flex; justify-content: center; overflow: hidden; pointer-events: none;"
    >
        <Confetti
            x={[-5, 5]}
            y={[0, 0.1]}
            delay={[0, 6000]}
            duration={4000}
            amount={1000}
            fallDistance="200vh"
        />
    </div>
{/if}

<style>
    .term-image {
        max-width: 18.6rem;
        max-height: 300px;
        margin: 0px;
        padding: 0px;
        border-radius: 0.8rem;
    }
    .flashcard-term-image {
        max-width: 300px;
        max-height: 200px;
        margin: 0px;
        padding: 0px;
        border-radius: 0.8rem;
    }
</style>
