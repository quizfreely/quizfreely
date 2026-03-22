<script lang="ts">
    import Noscript from "$lib/components/Noscript.svelte";
    import { onMount, tick } from "svelte";
    import { env } from "$env/dynamic/public";
    import { getClientSdk } from "$lib/graphql/sdk";
    import { idbApiLayer, idbLayerImg } from "$lib/idb-api-layer";
    import { goto, beforeNavigate } from "$app/navigation";
    import { cancelNprogressTimeout } from "$lib/stores/nprogressTimeout.js";
    let { data }: { data: any } = $props();
    import Dropdown from "$lib/components/Dropdown.svelte";
    import SubjectPicker from "$lib/components/SubjectPicker.svelte";

    import IconCheckmark from "$lib/icons/Checkmark.svelte";
    import IconTrash from "$lib/icons/Trash.svelte";
    import IconArrowLeft from "$lib/icons/ArrowLeft.svelte";
    import IconMoreDotsV from "$lib/icons/MoreDotsVertical.svelte";
    import IconArrowUp from "$lib/icons/ArrowUp.svelte";
    import IconArrowDown from "$lib/icons/ArrowDown.svelte";
    import IconPlus from "$lib/icons/Plus.svelte";
    import MenuIcon from "$lib/icons/Menu.svelte";
    import ImageIcon from "$lib/icons/Image.svelte";
    import XMarkIcon from "$lib/icons/CloseXMark.svelte";
    import PencilIcon from "$lib/icons/Pencil.svelte";

    import { flip } from "svelte/animate";
    import { scale, fade } from "svelte/transition";

    import AutoResizeTextarea from "$lib/components/AutoResizeTextarea.svelte";
    import FileInputBox from "$lib/components/FileInputBox.svelte";

    var showImportTermsModal = $state(false);
    var showExitConfirmationModal = $state(false);
    var showSubjectPicker = $state(false);
    let selectedSubject: { id: string; name: string } | null = $state(null);
    var unsavedChanges = false;
    var bypassUnsavedChangesConfirmation = false;
    let objectUrls: string[] = [];
    let showTermImageModal = $state(false);
    let termImageModalTerm: Term | undefined = $state();
    let termImageModalIsDefSide = $state(false);
    let termImageModalFiles: FileList | undefined = $state();
    let termImageModalFileInputBox: FileInputBox | undefined = $state();
    let isDraft = $state(false);
    let showRemoveTermImageModal = $state(false);
    let removeTermImageModalTerm: Term | undefined = $state();
    let removeTermImageModalIsDefSide: boolean = $state(false);
    let editTitleInputValue: string = $state("");
    let importTermsCustomRowDelimiterValue: string = $state("");
    let importTermsCustomTermDefDelimiterValue: string = $state("");
    let importTermsPasteValue: string = $state("");

    interface Term {
        key: number;
        id?: any;
        term: string;
        def: string;
        termImageUrl?: string | null;
        defImageUrl?: string | null;
        termTextarea?: HTMLTextAreaElement;
        defTextarea?: HTMLTextAreaElement;
        studysetId?: number;
        createdAt?: any;
        updatedAt?: any;
    }
    var terms: Term[] = $state([]);
    var existingTermIdsToDelete: any[] = [];
    var key = 0;
    function addTerm(
        term?: string,
        def?: string,
        id?: any,
        termImageUrl?: string,
        defImageUrl?: string,
    ) {
        terms.push({
            id: id,
            term: term ?? "",
            def: def ?? "",
            termImageUrl,
            defImageUrl,
            key: key,
        });
        key++;
    }
    function insertTerm(
        index: number,
        term?: string,
        def?: string,
        id?: any,
        termImageUrl?: string,
        defImageUrl?: string,
    ) {
        terms.splice(index, 0, {
            id: id,
            term: term ?? "",
            def: def ?? "",
            termImageUrl,
            defImageUrl,
            key: key,
        });
        key++;
    }
    function moveTerm(oldIndex: number, newIndex: number) {
        if (
            oldIndex >= 0 &&
            oldIndex < terms.length &&
            newIndex >= 0 &&
            newIndex < terms.length
        ) {
            var term = terms[oldIndex];
            terms.splice(oldIndex, 1);
            terms.splice(newIndex, 0, term);
        }
    }
    let deletedTermRegister: Term | undefined = $state();
    function deleteTerm(index: number, copyToRegister?: boolean) {
        if (terms[index].id != null) {
            existingTermIdsToDelete.push(terms[index].id);
        }
        const deletedTerm = terms.splice(index, 1)?.[0];
        if (copyToRegister) {
            deletedTermRegister = deletedTerm;
        }
    }
    function unmarkForDeletion(id: any) {
        const index = existingTermIdsToDelete.indexOf(id);
        if (index >= 0) {
            existingTermIdsToDelete.splice(index, 1);
        }
    }

    function addTermsFrom2DArray(arr: string[][]) {
        for (var row = 0; row < arr.length; row++) {
            addTerm(arr[row][0], arr[row][1]);
        }
    }

    const sdk = getClientSdk();

    async function initTerm(termsCount?: number, term?: string, def?: string) {
        let sortOrder = termsCount;
        if (sortOrder == null) {
            sortOrder = terms.length;
        }
        if (data.local) {
            const returnedKeys: any = await idbApiLayer.createTerms(data.localId as number, [
                {
                    term: term ?? "",
                    def: def ?? "",
                    sortOrder: sortOrder,
                } as any,
            ]); /* returns last key */
            return (returnedKeys as any)[0];
        } else {
            const resp = await sdk.InitTerm({
                studysetId: data.studysetId,
                term: term ?? "",
                def: def ?? "",
                sortOrder: sortOrder,
            });
            return resp.createTerms?.[0]?.id;
        }
    }

    let defFocused = $state(false);
    let focusedRow = $state(0);
    let showFocusBorder = $state(false);
    let useOhnoColorFocusBorder = $state(false);
    let keySeq: string[] = [];
    function addToKeySeq(key: string) {
        if ("hjkl".includes(key)) {
            resetKeySeq();
            /* dont return cause we want to remove ohnocolorfocusborder below */
        } else if (key == "Backspace") {
            keySeq.pop();
        } else {
            keySeq.push(key);
        }
        if (keySeq.length == 1 && keySeq[0] == "d") {
            showFocusBorder = true;
            useOhnoColorFocusBorder = true;
        } else {
            useOhnoColorFocusBorder = false;
        }
        return keySeq;
    }
    function resetKeySeq() {
        keySeq = [];
    }
    onMount(() => {
        (async function () {
            if (data.authed && !data.local) {
                document
                    .getElementById("edit-private-false")
                    ?.addEventListener("click", function () {
                        document
                            .getElementById("edit-private-false")
                            ?.classList.add("selected");
                        document
                            .getElementById("edit-private-true")
                            ?.classList.remove("selected");
                    });
                document
                    .getElementById("edit-private-true")
                    ?.addEventListener("click", function () {
                        document
                            .getElementById("edit-private-false")
                            ?.classList.remove("selected");
                        document
                            .getElementById("edit-private-true")
                            ?.classList.add("selected");
                    });
            }
            if (data.studysetId) {
                if (data.authed) {
                    sdk.GetStudyset({ id: data.studysetId as string })
                        .then((result) => {
                            if (result.studyset) {
                                const studyset = result.studyset;
                                editTitleInputValue = studyset.title;
                                if (studyset.private) {
                                    const privateFalse = document.getElementById("edit-private-false");
                                    privateFalse?.classList.remove("selected");
                                    document
                                        .getElementById("edit-private-true")
                                        ?.classList.add("selected");
                                } else {
                                    document
                                        .getElementById("edit-private-false")
                                        ?.classList.add("selected");
                                    document
                                        .getElementById("edit-private-true")
                                        ?.classList.remove("selected");
                                }
                                if (studyset.terms != null) {
                                    studyset.terms.forEach((t: any) => {
                                        addTerm(
                                            t.term,
                                            t.def,
                                            t.id,
                                            t.termImageUrl,
                                            t.defImageUrl,
                                        );
                                    });
                                }
                                selectedSubject = (studyset.subject as any) ?? null;
                                isDraft = studyset.draft;

                                if (studyset.draft && terms.length == 0) {
                                    addTerm();
                                }
                            }
                        }).catch(err => {
                            alert("Error loading studyset");
                            console.error(err);
                        });
                } else {
                    console.error(
                        "Unexpected situation: studyset is not local but user is not logged in",
                    );
                }
            } else {
                const studysetRecord = await idbApiLayer.getStudysetById(
                    data.localId as number,
                    {
                        terms: {
                            termImageUrl: true,
                            defImageUrl: true,
                        },
                    },
                );
                if (studysetRecord) {
                    editTitleInputValue = studysetRecord.title;
                    if (studysetRecord.terms != null) {
                        studysetRecord.terms.forEach((t: any) => {
                            addTerm(
                                t.term,
                                t.def,
                                t.id,
                                t.termImageUrl,
                                t.defImageUrl,
                            );
                            if (t?.termImageUrl != null) {
                                objectUrls.push(t.termImageUrl);
                            }
                            if (t?.defImageUrl != null) {
                                objectUrls.push(t.defImageUrl);
                            }
                        });
                    }
                    isDraft = studysetRecord.draft;

                    if (studysetRecord.draft && terms.length == 0) {
                        addTerm();
                    }
                }
            }
        })();

        function moveUpButForKeydown(refocus?: boolean) {
            const index = focusedRow;
            const newIndex = focusedRow - 1;
            const wasDefFocused = defFocused;

            if (newIndex >= 0) {
                moveTerm(index, newIndex);
                unsavedChanges = true;

                tick().then(() => {
                    focusedRow = newIndex;
                    if (refocus) {
                        if (wasDefFocused) {
                            terms?.[newIndex]?.defTextarea?.focus();
                        } else {
                            terms?.[newIndex]?.termTextarea?.focus();
                        }
                    }
                });
            }
        }
        function moveDownButForKeydown(refocus?: boolean) {
            const index = focusedRow;
            const newIndex = focusedRow + 1;
            const wasDefFocused = defFocused;

            if (newIndex < terms?.length) {
                moveTerm(index, newIndex);
                unsavedChanges = true;

                tick().then(() => {
                    focusedRow = newIndex;
                    if (refocus) {
                        if (wasDefFocused) {
                            terms?.[newIndex]?.defTextarea?.focus();
                        } else {
                            terms?.[newIndex]?.termTextarea?.focus();
                        }
                    }
                });
            }
        }
        function onKeydown(event: KeyboardEvent) {
            if (event.key === "Enter" && event.ctrlKey && !event.altKey) {
                event.preventDefault();
                addTerm();
                unsavedChanges = true;
                tick().then(() => {
                    terms?.[terms?.length - 1]?.termTextarea?.focus();
                });
                return;
            }
            if (
                (event.key === "Enter" && event.altKey) ||
                (event.key === "o" &&
                    !(
                        document.activeElement?.tagName === "INPUT" ||
                        document.activeElement?.tagName === "TEXTAREA" ||
                        (document.activeElement instanceof HTMLElement &&
                            document.activeElement?.isContentEditable)
                    ))
            ) {
                event.preventDefault();
                let indexWeWant = 0;
                if (focusedRow + 1 <= terms?.length) {
                    indexWeWant = focusedRow + 1;
                }
                insertTerm(indexWeWant);
                unsavedChanges = true;

                tick().then(() => {
                    focusedRow = indexWeWant;
                    terms?.[indexWeWant]?.termTextarea?.focus();
                });
                return;
            }
            if (
                event.key === "O" &&
                !(
                    document.activeElement?.tagName === "INPUT" ||
                    document.activeElement?.tagName === "TEXTAREA" ||
                    (document.activeElement instanceof HTMLElement &&
                        document.activeElement?.isContentEditable)
                )
            ) {
                event.preventDefault();
                insertTerm(focusedRow);
                unsavedChanges = true;

                tick().then(() => {
                    focusedRow = focusedRow;
                    terms?.[focusedRow]?.termTextarea?.focus();
                });
                return;
            }

            if (event.key === "ArrowUp" && event.altKey && !event.shiftKey) {
                event.preventDefault();
                if (defFocused) {
                    terms?.[focusedRow - 1]?.defTextarea?.focus();
                } else {
                    terms?.[focusedRow - 1]?.termTextarea?.focus();
                }
                return;
            }
            if (event.key === "ArrowDown" && event.altKey && !event.shiftKey) {
                event.preventDefault();
                if (defFocused) {
                    terms?.[focusedRow + 1]?.defTextarea?.focus();
                } else {
                    terms?.[focusedRow + 1]?.termTextarea?.focus();
                }
                return;
            }

            if (event.key === "ArrowUp" && event.altKey && event.shiftKey) {
                event.preventDefault();
                moveUpButForKeydown(true);
                return;
            }
            if (event.key === "ArrowDown" && event.altKey && event.shiftKey) {
                event.preventDefault();
                moveDownButForKeydown(true);
                return;
            }

            if (
                (event.key === "j" ||
                    (event.key === "ArrowDown" &&
                        !event.shiftKey &&
                        !event.ctrlKey)) &&
                !(
                    document.activeElement?.tagName === "INPUT" ||
                    document.activeElement?.tagName === "TEXTAREA" ||
                    (document.activeElement instanceof HTMLElement &&
                        document.activeElement?.isContentEditable)
                )
            ) {
                event.preventDefault();
                if (focusedRow + 1 < terms?.length) {
                    focusedRow++;
                }
                showFocusBorder = true;
                return;
            }
            if (
                (event.key === "k" ||
                    (event.key === "ArrowUp" &&
                        !event.shiftKey &&
                        !event.ctrlKey)) &&
                !(
                    document.activeElement?.tagName === "INPUT" ||
                    document.activeElement?.tagName === "TEXTAREA" ||
                    (document.activeElement instanceof HTMLElement &&
                        document.activeElement?.isContentEditable)
                )
            ) {
                event.preventDefault();
                if (focusedRow - 1 >= 0) {
                    focusedRow--;
                }
                showFocusBorder = true;
                return;
            }
            if (
                (event.key === "h" || event.key === "ArrowLeft") &&
                !(
                    document.activeElement?.tagName === "INPUT" ||
                    document.activeElement?.tagName === "TEXTAREA" ||
                    (document.activeElement instanceof HTMLElement &&
                        document.activeElement?.isContentEditable)
                )
            ) {
                event.preventDefault();
                defFocused = false;
                showFocusBorder = true;
                return;
            }
            if (
                (event.key === "l" || event.key === "ArrowRight") &&
                !(
                    document.activeElement?.tagName === "INPUT" ||
                    document.activeElement?.tagName === "TEXTAREA" ||
                    (document.activeElement instanceof HTMLElement &&
                        document.activeElement?.isContentEditable)
                )
            ) {
                event.preventDefault();
                defFocused = true;
                showFocusBorder = true;
                return;
            }
            if (
                event.key === "ArrowDown" &&
                (event.shiftKey || event.ctrlKey) &&
                !(
                    document.activeElement?.tagName === "INPUT" ||
                    document.activeElement?.tagName === "TEXTAREA" ||
                    (document.activeElement instanceof HTMLElement &&
                        document.activeElement?.isContentEditable)
                )
            ) {
                event.preventDefault();
                moveDownButForKeydown(false);
                return;
            }
            if (
                event.key === "ArrowUp" &&
                (event.shiftKey || event.ctrlKey) &&
                !(
                    document.activeElement?.tagName === "INPUT" ||
                    document.activeElement?.tagName === "TEXTAREA" ||
                    (document.activeElement instanceof HTMLElement &&
                        document.activeElement?.isContentEditable)
                )
            ) {
                event.preventDefault();
                moveUpButForKeydown(false);
                return;
            }
            if (
                !(event.ctrlKey || event.altKey) &&
                !(
                    document.activeElement?.tagName === "INPUT" ||
                    document.activeElement?.tagName === "TEXTAREA" ||
                    (document.activeElement instanceof HTMLElement &&
                        document.activeElement?.isContentEditable)
                ) &&
                (event.key === "i" || event.key === "Enter")
            ) {
                event.preventDefault();
                if (defFocused) {
                    terms?.[focusedRow]?.defTextarea?.focus();
                } else {
                    terms?.[focusedRow]?.termTextarea?.focus();
                }
                return;
            }
        }
        function onKeyup(event: KeyboardEvent) {
            if (
                event.key === "Escape" &&
                document?.activeElement instanceof HTMLElement
            ) {
                document?.activeElement?.blur();
                resetKeySeq();
                if (showFocusBorder) {
                    showFocusBorder = false;
                }
                return;
            }
            if (
                [
                    "Alt",
                    "AltGraph",
                    "CapsLock",
                    "Control",
                    "Fn",
                    "FnLock",
                    "Hyper",
                    "Meta",
                    "NumLock",
                    "ScrollLock",
                    "Shift",
                    "Super",
                    "Symbol",
                    "SymbolLock",
                    "Compose",
                    "Dead",
                ].includes(event.key)
            ) {
                return;
            }
            if (
                event.key == "p" &&
                !(
                    document.activeElement?.tagName === "INPUT" ||
                    document.activeElement?.tagName === "TEXTAREA" ||
                    (document.activeElement instanceof HTMLElement &&
                        document.activeElement?.isContentEditable)
                )
            ) {
                if (deletedTermRegister) {
                    let indexWeWant = 0;
                    if (focusedRow + 1 <= terms?.length) {
                        indexWeWant = focusedRow + 1;
                    }
                    insertTerm(
                        indexWeWant,
                        deletedTermRegister?.term,
                        deletedTermRegister?.def,
                        deletedTermRegister?.id ?? undefined,
                    );

                    tick().then(() => {
                        focusedRow = indexWeWant;
                    });

                    if (deletedTermRegister?.id) {
                        unmarkForDeletion(deletedTermRegister?.id);

                        /* next time, if i paste again, i need a new id,
                        so set .id to undefined, but keep .term and .def */
                        deletedTermRegister.id = undefined;
                    }
                }
                resetKeySeq();
                return;
            }
            if (
                event.key == "P" &&
                !(
                    document.activeElement?.tagName === "INPUT" ||
                    document.activeElement?.tagName === "TEXTAREA" ||
                    (document.activeElement instanceof HTMLElement &&
                        document.activeElement?.isContentEditable)
                )
            ) {
                if (deletedTermRegister) {
                    insertTerm(
                        focusedRow,
                        deletedTermRegister?.term,
                        deletedTermRegister?.def,
                        deletedTermRegister?.id ?? undefined,
                    );

                    if (deletedTermRegister?.id) {
                        unmarkForDeletion(deletedTermRegister?.id);

                        /* next time, if i paste again, i need a new id,
                        so set .id to undefined, but keep .term and .def */
                        deletedTermRegister.id = undefined;
                    }
                }
                resetKeySeq();
                return;
            }
            if (
                !(
                    document.activeElement?.tagName === "INPUT" ||
                    document.activeElement?.tagName === "TEXTAREA" ||
                    (document.activeElement instanceof HTMLElement &&
                        document.activeElement?.isContentEditable)
                )
            ) {
                const newKeySeq = addToKeySeq(event.key);
                if (
                    newKeySeq.length == 2 &&
                    newKeySeq[0] == "d" &&
                    newKeySeq[1] == "d"
                ) {
                    deleteTerm(focusedRow, true);
                    resetKeySeq();

                    tick().then(() => {
                        if (focusedRow == terms?.length) {
                            focusedRow--;
                        }
                    });
                }
            }
        }
        window.addEventListener("keydown", onKeydown);
        window.addEventListener("keyup", onKeyup);
        return () => {
            window.removeEventListener("keydown", onKeydown);
            window.removeEventListener("keyup", onKeyup);
            objectUrls.forEach((objectUrl) => {
                URL.revokeObjectURL(objectUrl);
            });
        };
    });

    var updateLocalStudysetCooldown = false;
    function updateLocalStudyset() {
        if (updateLocalStudysetCooldown) {
            return;
        }

        updateLocalStudysetCooldown = true;
        setTimeout(function () {
            updateLocalStudysetCooldown = false;
        }, 2000);

        let existingTerms: any[] = [];
        let newTerms: any[] = [];
        for (let index = 0; index < terms.length; index++) {
            if (terms[index].id != null) {
                existingTerms.push({
                    id: terms[index].id as string,
                    term: terms[index].term,
                    def: terms[index].def,
                    sortOrder: index,
                });
            } else {
                newTerms.push({
                    term: terms[index].term,
                    def: terms[index].def,
                    sortOrder: index,
                });
            }
        }

        (async () => {
            await idbApiLayer.updateStudyset({
                id: data.localId as number,
                title: editTitleInputValue,
                draft: false,
            });
            if (existingTerms.length > 0) {
                await idbApiLayer.updateTerms(existingTerms as any[]);
            }
            if (newTerms.length > 0) {
                await idbApiLayer.createTerms(data.localId as number, newTerms as any[]);
            }
            if (existingTermIdsToDelete.length > 0) {
                await idbApiLayer.deleteTerms(existingTermIdsToDelete as number[]);
            }
            goto("/studyset/local?id=" + data.localId);
        })();
    }

    var updateCloudStudysetCooldown = false;
    function updateCloudStudyset() {
        if (updateCloudStudysetCooldown) {
            return;
        }

        updateCloudStudysetCooldown = true;
        setTimeout(function () {
            updateCloudStudysetCooldown = false;
        }, 2000);

        let existingTerms: any[] = [];
        let newTerms: any[] = [];
        for (let index = 0; index < terms.length; index++) {
            if (terms[index].id != null) {
                existingTerms.push({
                    id: terms[index].id as string,
                    term: terms[index].term,
                    def: terms[index].def,
                    sortOrder: index,
                });
            } else {
                newTerms.push({
                    term: terms[index].term,
                    def: terms[index].def,
                    sortOrder: index,
                });
            }
        }

        sdk.UpdateStudysetAndTerms({
            id: data.studysetId,
            studyset: {
                title: editTitleInputValue,
                private: document
                    .getElementById("edit-private-true")
                    ?.classList.contains("selected") ?? false,
                subjectId: selectedSubject?.id ?? null,
            },
            terms: existingTerms,
            newTerms: newTerms,
            deleteTerms: existingTermIdsToDelete as string[],
        })
            .then((result) => {
                goto("/studysets/" + data.studysetId);
            }).catch(err => {
                console.log(err);
                alert("Error updating studyset");
            });
    }
    function saveButton() {
        bypassUnsavedChangesConfirmation = true;
        if (data.local) {
            updateLocalStudyset();
        } else {
            updateCloudStudyset();
        }

        // fetch("/dashboard/set-dashboard-state", {
        //     method: "POST",
        //     credentials: "include",
        // });
    }

    let importTermsTermDefDelimiterRadioSelect = $state("tab");
    let importTermsRowDelimiterRadioSelect = $state("newline");

    let navigatingToURL: URL | undefined = $state();
    beforeNavigate(function (navigation) {
        if (unsavedChanges && !bypassUnsavedChangesConfirmation) {
            navigatingToURL = navigation?.to?.url;
            if (navigation.type !== "leave") {
                /* when navigation.type is NOT "leave",
                it's controlled by SvelteKit, so we can
                show our js confirmation modal */
                showExitConfirmationModal = true;
            }
            /* our routes/+layout.svelte shows a progress bar
            if navigation takes too long, so we cancel the timer
            when we cancel navigation, so that it doesn't show */
            cancelNprogressTimeout();

            /* run it again a little delayed to make sure it cancels the timeout after layout actually finishes creating the timeout */
            setTimeout(cancelNprogressTimeout, 50);

            /* if navigation.type is "leave",
            then its controlled by the browser &
            the browser shows it's own native modal
            when we use `.cancel()` */
            navigation.cancel();
        }
    });
</script>

<svelte:head>
    <title>Quizfreely</title>
    <meta name="robots" content="noindex, follow" />
</svelte:head>

{#snippet termImage(term: Term, isDefSide: boolean)}
    {#if term?.[isDefSide ? "defImageUrl" : "termImageUrl"] == null}
        <div class="flex" style="margin-top: 0.2rem;">
            <button
                class="faint img-button-thin-fit text fg0"
                onclick={async () => {
                    if (term.id == null) {
                        term.id = await initTerm(); /* returns ID */
                    }

                    showTermImageModal = true;
                    termImageModalTerm = term;
                    termImageModalIsDefSide = isDefSide;
                }}
            >
                <ImageIcon></ImageIcon> Add Image
            </button>
        </div>
    {:else}
        <div
            class="flex"
            style="flex-direction: column; flex-wrap: nowrap; gap: 0.2rem; margin-top: 0.6rem;"
        >
            <div>
                <img
                    src={term?.[isDefSide ? "defImageUrl" : "termImageUrl"] ?? ""}
                    alt="{isDefSide ? 'definition' : 'term'} image"
                    class="term-image"
                />
            </div>
            <div
                class="flex"
                style="margin-top: 0px; row-gap: 0.2rem; column-gap: 0.4rem;"
            >
                <button
                    class="faint img-button-thin-fit text fg0"
                    onclick={async () => {
                        showTermImageModal = true;
                        termImageModalTerm = term;
                        termImageModalIsDefSide = isDefSide;
                    }}
                >
                    <PencilIcon></PencilIcon> Edit Image
                </button>
                <button
                    class="faint img-button-thin-fit text fg0"
                    onclick={async () => {
                        showRemoveTermImageModal = true;
                        removeTermImageModalTerm = term;
                        removeTermImageModalIsDefSide = isDefSide;
                    }}
                >
                    <XMarkIcon></XMarkIcon> Remove Image
                </button>
            </div>
        </div>
    {/if}
{/snippet}

<Noscript />
<main>
    <div class="grid page" style="min-height: 80vh;">
        <div class="content">
            <div>
                <a
                    class="button faint"
                    data-sveltekit-preload-data="false"
                    href={isDraft
                        ? "/dashboard"
                        : data.local
                          ? "/studyset/local?id=" + data.localId
                          : "/studysets/" + data.studysetId}
                >
                    <IconArrowLeft />
                    Back
                </a>
            </div>
            <input
                type="text"
                placeholder="Title"
                bind:value={editTitleInputValue}
            />
            {#if data.authed && !data.local}
                <div id="edit-private-div">
                    <div class="flex">
                        <button
                            class="button-box selected"
                            id="edit-private-false"
                            onclick={() => (unsavedChanges = true)}
                        >
                            <IconCheckmark class="button-box-selected-icon" />
                            Public
                        </button>
                        <button
                            class="button-box"
                            id="edit-private-true"
                            onclick={() => (unsavedChanges = true)}
                        >
                            <IconCheckmark class="button-box-selected-icon" />
                            Private
                        </button>
                    </div>
                </div>
                <div class="flex" style="align-items: center;">
                    <button
                        class="button-box flex"
                        style="display: flex; gap: 0.4rem; align-items: center;"
                        onclick={() => (showSubjectPicker = true)}
                    >
                        <MenuIcon class="text fg0"></MenuIcon>
                        <span
                            ><span class="fg0">Subject:</span>
                            {selectedSubject?.name ?? "None"}</span
                        >
                    </button>
                </div>
            {/if}

            <div id="edit-terms-rows">
                {#each terms as term, index (term.key)}
                    <div
                        class="grid box term-row-box"
                        animate:flip={{ duration: 400 }}
                        transition:scale={{ duration: 400 }}
                    >
                        <div>
                            <AutoResizeTextarea
                                div={{
                                    class: "term-row-box-term",
                                }}
                                textarea={{
                                    placeholder: "Term",
                                    rows: "2",
                                    oninput: () => {
                                        if (!unsavedChanges) {
                                            unsavedChanges = true;
                                        }
                                    },
                                    onfocus: () => {
                                        defFocused = false;
                                        focusedRow = index;
                                        showFocusBorder = false;
                                        resetKeySeq();
                                    },
                                    style: `transition-duration: 0.2s; ` + (
                                        showFocusBorder &&
                                        useOhnoColorFocusBorder &&
                                        !defFocused &&
                                        focusedRow == index
                                            ? "border-color: var(--ohno);"
                                            : showFocusBorder &&
                                                !defFocused &&
                                                focusedRow == index
                                              ? "border-color: var(--main)"
                                              : ""
                                    ),
                                }}
                                bind:value={term.term}
                                bind:textareaElement={term.termTextarea}
                            />
                            {#if env.ENABLE_TERM_IMAGES != "false"}
                                {@render termImage(term, false)}
                            {/if}
                        </div>
                        <div>
                            <AutoResizeTextarea
                                div={{
                                    class: "term-row-box-def",
                                }}
                                textarea={{
                                    placeholder: "Definition",
                                    rows: "2",
                                    oninput: () => {
                                        if (!unsavedChanges) {
                                            unsavedChanges = true;
                                        }
                                    },
                                    onfocus: () => {
                                        defFocused = true;
                                        focusedRow = index;
                                        showFocusBorder = false;
                                        resetKeySeq();
                                    },
                                    style: `transition-duration: 0.2s; ` + (
                                        showFocusBorder &&
                                        useOhnoColorFocusBorder &&
                                        defFocused &&
                                        focusedRow == index
                                            ? "border-color: var(--ohno);"
                                            : showFocusBorder &&
                                                defFocused &&
                                                focusedRow == index
                                              ? "border-color: var(--main)"
                                              : ""
                                    ),
                                }}
                                bind:value={term.def}
                                bind:textareaElement={term.defTextarea}
                            />
                            {#if env.ENABLE_TERM_IMAGES != "false"}
                                {@render termImage(term, true)}
                            {/if}
                        </div>
                        <div class="flex center term-row-box-actions">
                            <Dropdown
                                button={{
                                    class: "dropdown-toggle",
                                    "aria-label": "Actions dropdown menu",
                                }}
                            >
                                {#snippet buttonContent()}
                                    <IconMoreDotsV />
                                {/snippet}
                                {#snippet divContent(hide: any)}
                                    <button
                                        onclick={function (event: any) {
                                            moveTerm(index, index - 1);
                                            unsavedChanges = true;
                                            hide?.();
                                        }}
                                    >
                                        <IconArrowUp /> Move up
                                    </button>
                                    <button
                                        onclick={function (event: any) {
                                            moveTerm(index, index + 1);
                                            unsavedChanges = true;
                                            hide?.();
                                        }}
                                    >
                                        <IconArrowDown /> Move down
                                    </button>
                                    <button
                                        onclick={function (event: any) {
                                            insertTerm(index + 1);
                                            unsavedChanges = true;
                                            hide?.();
                                        }}
                                    >
                                        <IconPlus /> Add Below
                                    </button>
                                    <button
                                        class="ohno"
                                        onclick={function () {
                                            deleteTerm(index);
                                            unsavedChanges = true;
                                        }}
                                    >
                                        <IconTrash /> Delete
                                    </button>
                                {/snippet}
                            </Dropdown>
                        </div>
                    </div>
                {:else}
                    <div class="box">
                        <p class="fg0">
                            No terms?
                            <span class="line"
                                >Tap "add term" to create one or use "import
                                terms" to transfer them from somewhere else.</span
                            >
                        </p>
                    </div>
                {/each}
            </div>
            <div class="box">
                <div class="flex">
                    <button
                        onclick={function () {
                            addTerm();
                            unsavedChanges = true;
                            tick().then(() =>
                                terms?.[
                                    terms?.length - 1
                                ]?.termTextarea?.focus(),
                            );
                        }}
                    >
                        <IconPlus />
                        Add term
                    </button>
                    <button
                        class="alt"
                        onclick={function () {
                            showImportTermsModal = true;
                        }}
                    >
                        <IconPlus />
                        Import terms
                    </button>
                </div>
            </div>
            <div class="flex" style="align-items:center;">
                <button
                    data-sveltekit-preload-data="false"
                    onclick={saveButton}
                >
                    <IconCheckmark />
                    {#if isDraft}
                        Create
                    {:else}
                        Save
                    {/if}
                </button>
                <a
                    class="button alt"
                    data-sveltekit-preload-data="false"
                    href={isDraft
                        ? "/dashboard"
                        : data.local
                          ? "/studyset/local?id=" + data.localId
                          : "/studysets/" + data.studysetId}
                >
                    Cancel
                </a>
            </div>
            {#if showImportTermsModal}
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
                                            class="button-box {importTermsTermDefDelimiterRadioSelect ==
                                            'tab'
                                                ? 'selected'
                                                : ''}"
                                            onclick={() =>
                                                (importTermsTermDefDelimiterRadioSelect =
                                                    "tab")}
                                        >
                                            <IconCheckmark
                                                class="button-box-selected-icon"
                                            ></IconCheckmark>
                                            Tab
                                        </button>
                                        <button
                                            class="button-box {importTermsTermDefDelimiterRadioSelect ==
                                            'comma'
                                                ? 'selected'
                                                : ''}"
                                            onclick={() =>
                                                (importTermsTermDefDelimiterRadioSelect =
                                                    "comma")}
                                        >
                                            <IconCheckmark
                                                class="button-box-selected-icon"
                                            ></IconCheckmark>
                                            Comma
                                        </button>
                                        <button
                                            class="button-box {importTermsTermDefDelimiterRadioSelect ==
                                            'custom'
                                                ? 'selected'
                                                : ''}"
                                            onclick={() =>
                                                (importTermsTermDefDelimiterRadioSelect =
                                                    "custom")}
                                        >
                                            <IconCheckmark
                                                class="button-box-selected-icon"
                                            ></IconCheckmark>
                                            Custom
                                        </button>
                                    </div>
                                </div>
                                {#if importTermsTermDefDelimiterRadioSelect == "custom"}
                                    <input
                                        type="text"
                                        placeholder="Term Delimiter"
                                        bind:value={
                                            importTermsCustomTermDefDelimiterValue
                                        }
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
                                            class="button-box {importTermsRowDelimiterRadioSelect ==
                                            'newline'
                                                ? 'selected'
                                                : ''}"
                                            onclick={() =>
                                                (importTermsRowDelimiterRadioSelect =
                                                    "newline")}
                                        >
                                            <IconCheckmark
                                                class="button-box-selected-icon"
                                            ></IconCheckmark>
                                            New line
                                        </button>
                                        <button
                                            class="button-box {importTermsRowDelimiterRadioSelect ==
                                            'semicolon'
                                                ? 'selected'
                                                : ''}"
                                            onclick={() =>
                                                (importTermsRowDelimiterRadioSelect =
                                                    "semicolon")}
                                        >
                                            <IconCheckmark
                                                class="button-box-selected-icon"
                                            ></IconCheckmark>
                                            Semicolon
                                        </button>
                                        <button
                                            class="button-box {importTermsRowDelimiterRadioSelect ==
                                            'custom'
                                                ? 'selected'
                                                : ''}"
                                            onclick={() =>
                                                (importTermsRowDelimiterRadioSelect =
                                                    "custom")}
                                        >
                                            <IconCheckmark
                                                class="button-box-selected-icon"
                                            ></IconCheckmark>
                                            Custom
                                        </button>
                                    </div>
                                </div>
                                {#if importTermsRowDelimiterRadioSelect == "custom"}
                                    <input
                                        type="text"
                                        placeholder="Row Delimiter"
                                        bind:value={
                                            importTermsCustomRowDelimiterValue
                                        }
                                        class="slightly-smaller-textbox"
                                        transition:scale={{ duration: 400 }}
                                    />
                                {/if}
                            </div>
                        </div>
                        <textarea
                            id="import-terms-paste-textarea"
                            bind:value={importTermsPasteValue}
                            class="vertical"
                            rows="3"
                            placeholder="Paste data here, then press the import button"
                        ></textarea>
                        <div class="flex">
                            <button
                                onclick={function () {
                                    var termDefDelimiter: string = importTermsTermDefDelimiterRadioSelect == "tab" ?
                                        "\t" : (importTermsTermDefDelimiterRadioSelect == "comma" ?
                                            "," : importTermsCustomTermDefDelimiterValue
                                        );
                                    var rowDelimiter: string = importTermsRowDelimiterRadioSelect == "newline" ?
                                        "\n" : (importTermsRowDelimiterRadioSelect == "semicolon" ?
                                            ";" : importTermsCustomRowDelimiterValue
                                        );
                                    if (termDefDelimiter == "") {
                                        alert(
                                            "Custom delimiter can't be blank >:(",
                                        );
                                        return;
                                    }
                                    if (rowDelimiter == "") {
                                        alert(
                                            "Custom delimiter can't be blank >:(",
                                        );
                                        return;
                                    }

                                    /* we add a blank term when users create a studyset,
                      so if a user imports terms without changing that blank term
                      we probably don't want them to have a blank term right before their imported terms
                      
                      so we check if there's only one, blank, term, and delete it if so before importing terms */
                                    if (
                                        terms.length === 1 &&
                                        terms[0].term === "" &&
                                        terms[0].def === ""
                                    ) {
                                        terms.splice(0, 1);
                                    }

                                    var pastedData = importTermsPasteValue;
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
            {/if}
            {#snippet subjectPickerErrMsg()}
                <div class="box ohno">
                    <p>Error setting subject :(</p>
                </div>
            {/snippet}
            {#if showSubjectPicker}
                <SubjectPicker
                    selectCallback={(subject: any) => {
                        selectedSubject = subject;
                        showSubjectPicker = false;
                        unsavedChanges = true;
                    }}
                    closeCallback={() => (showSubjectPicker = false)}
                ></SubjectPicker>
            {/if}
            {#if showExitConfirmationModal}
                <div class="modal" transition:fade={{ duration: 200 }}>
                    <div class="content">
                        <h4>Save changes?</h4>
                        <div class="flex flexcolonmobile">
                            <button
                                data-sveltekit-preload-data="false"
                                onclick={saveButton}
                                class="yay alt"
                            >
                                <IconCheckmark />
                                Save
                            </button>
                            <button
                                class="alt"
                                onclick={function () {
                                    showExitConfirmationModal = false;
                                }}>Continue Editing</button
                            >
                            <button
                                class="button ohno alt"
                                data-sveltekit-preload-data="false"
                                onclick={function () {
                                    bypassUnsavedChangesConfirmation = true;
                                    if (navigatingToURL !== undefined) {
                                        goto(navigatingToURL);
                                    }
                                }}
                            >
                                <IconTrash />
                                Discard Changes
                            </button>
                        </div>
                    </div>
                </div>
            {/if}
            {#if showTermImageModal}
                <div class="modal" transition:fade={{ duration: 200 }}>
                    <div class="content">
                        <h4>
                            {termImageModalTerm?.[
                                termImageModalIsDefSide
                                    ? "defImageUrl"
                                    : "termImageUrl"
                            ] == null
                                ? "Add Image"
                                : "Update Image"}
                        </h4>
                        <FileInputBox
                            accept="image/jpeg, image/png, image/webp, .jpeg, .jpg, .png, .webp"
                            bind:this={termImageModalFileInputBox}
                            onChangeCallback={(files: FileList) =>
                                (termImageModalFiles = files)}
                        ></FileInputBox>
                        <div class="flex">
                            <button
                                class="pretty-button-disableable"
                                disabled={termImageModalFiles == null ||
                                    termImageModalFiles.length == 0}
                                onclick={async () => {
                                    if (termImageModalTerm === undefined || termImageModalFiles === undefined) {
                                        console.error("term image save button: termImageModalTerm or termImageModalFiles is undefined");
                                        return;
                                    }
                                    if (data.local) {
                                        const returnedBlob =
                                            await idbLayerImg.processAndUpdateTermImage(
                                                termImageModalTerm.id,
                                                termImageModalIsDefSide,
                                                termImageModalFiles[0],
                                            );
                                        if (returnedBlob != null) {
                                            const newObjectUrl =
                                                URL.createObjectURL(
                                                    returnedBlob,
                                                );
                                            (termImageModalTerm as any)[
                                                termImageModalIsDefSide
                                                    ? "defImageUrl"
                                                    : "termImageUrl"
                                            ] = newObjectUrl;
                                            objectUrls.push(newObjectUrl);
                                        }
                                        showTermImageModal = false;
                                        termImageModalFileInputBox?.clear();
                                    } else {
                                        const raw = await fetch(
                                            "/api/term-images/" + termImageModalTerm.id + "/" + (termImageModalIsDefSide ? "def" : "term"),
                                            {
                                                method: "PUT",
                                                body: termImageModalFiles[0],
                                            },
                                        );
                                        const resp = await raw.json();
                                        if (resp?.data?.imageUrl == null) {
                                            console.error(
                                                "Error in term-image-upload resp: ",
                                                resp,
                                            );
                                        } else {
                                            (termImageModalTerm as any)[
                                                termImageModalIsDefSide
                                                    ? "defImageUrl"
                                                    : "termImageUrl"
                                            ] = resp.data.imageUrl;
                                        }
                                        showTermImageModal = false;
                                        termImageModalFileInputBox?.clear();
                                    }
                                }}
                            >
                                <IconCheckmark></IconCheckmark> Save
                            </button>
                            <button
                                class="alt"
                                onclick={() => {
                                    showTermImageModal = false;
                                    termImageModalFileInputBox?.clear();
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            {/if}
            {#if showRemoveTermImageModal}
                <div class="modal" transition:fade={{ duration: 200 }}>
                    <div class="content">
                        <h4>Remove Image?</h4>
                        <p>
                            Are you sure you want to remove this term's image?
                        </p>
                        <div class="flex">
                            <button
                                class="ohno"
                                onclick={async () => {
                                    if (!removeTermImageModalTerm) return;
                                    if (data.local) {
                                        const oldObjectUrl =
                                            (removeTermImageModalTerm as any)[
                                                removeTermImageModalIsDefSide
                                                    ? "defImageUrl"
                                                    : "termImageUrl"
                                            ];

                                        const success =
                                            await idbLayerImg.removeTermImage(
                                                removeTermImageModalTerm.id,
                                                removeTermImageModalIsDefSide,
                                            );
                                        if (success) {
                                            (removeTermImageModalTerm as any)[
                                                removeTermImageModalIsDefSide
                                                    ? "defImageUrl"
                                                    : "termImageUrl"
                                            ] = undefined;
                                            if (oldObjectUrl != null) {
                                                URL.revokeObjectURL(
                                                    oldObjectUrl,
                                                );
                                            }
                                        } else {
                                            alert(
                                                "Error removing term image :(",
                                            );
                                        }
                                        showRemoveTermImageModal = false;
                                    } else {
                                        const raw = await fetch(
                                            "/api/term-images/" + removeTermImageModalTerm.id + "/" + (removeTermImageModalIsDefSide ? "def" : "term"),
                                            {
                                                method: "DELETE",
                                            },
                                        );
                                        const resp = await raw.json();
                                        if (resp?.error) {
                                            console.error(
                                                "Error in remove-term-image resp: ",
                                                resp,
                                            );
                                        } else {
                                            (removeTermImageModalTerm as any)[
                                                removeTermImageModalIsDefSide
                                                    ? "defImageUrl"
                                                    : "termImageUrl"
                                            ] = null;
                                        }
                                        showRemoveTermImageModal = false;
                                    }
                                }}
                            >
                                <IconTrash></IconTrash> Remove
                            </button>
                            <button
                                class="alt"
                                onclick={() => {
                                    showRemoveTermImageModal = false;
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            {/if}
        </div>
    </div>
</main>

<style>
    .term-row-box {
        gap: 1rem;
        grid-template-rows: auto;
        grid-template-columns: 1fr 1fr auto;
        grid-template-areas: "term def actions";
        padding-bottom: 0.4rem;
    }

    .term-row-box > :global(.term-row-box-term) {
        grid-area: term;
        resize: none;
    }
    .term-row-box > :global(.term-row-box-def) {
        grid-area: def;
        resize: none;
    }
    .term-row-box-actions {
        grid-area: actions;
    }

    .flexcolonmobile {
        flex-direction: row;
        align-content: center;
    }
    @media only screen and (max-width: 800px) {
        .flexcolonmobile {
            flex-direction: column;
            align-content: start;
        }

        .term-row-box {
            grid-template-rows: auto auto;
            grid-template-columns: 1fr auto;
            grid-template-areas:
                "term actions"
                "def actions";
        }
    }

    .import-terms-split {
        display: grid;
        gap: 1rem;
        grid-template-rows: auto;
        grid-template-columns: 1fr 1fr;
    }
    #import-terms-paste-textarea {
        width: 100%;
    }

    .slightly-smaller-textbox {
        width: 10rem;
    }

    button.img-button-thin-fit {
        padding: 0.4rem 0.6rem;
        font-size: 0.9rem;
    }

    button.pretty-button-disableable:disabled {
        opacity: 0.6;
    }

    .term-image {
        max-width: 400px;
        max-height: 300px;
        margin: 0px;
        padding: 0px;
        border-radius: 0.8rem;
    }
</style>
