<script>
    import Noscript from "$lib/components/Noscript.svelte";
    import { onMount } from "svelte";
    import { goto, beforeNavigate, invalidateAll } from '$app/navigation';
    import ProseMirrorEditor from "$lib/proseMirrorEditor.svelte";
    import { DOMSerializer, Node } from "prosemirror-model";
    import { schema } from "$lib/proseMirrorSchema.js";
    import { cancelNprogressTimeout } from "$lib/stores/nprogressTimeout.js";
    import IconBackArrow from "$lib/icons/BackArrow.svelte";
    import IconCheckmark from "$lib/icons/Checkmark.svelte";
    import IconClock from "$lib/icons/Clock.svelte";
    import IconTrash from "$lib/icons/Trash.svelte";
    import 'vanillajs-datepicker/css/datepicker.css';
    import "$lib/vanillajsDatepickerCustomEhui.css";
    import { fade } from "svelte/transition";
    let { data } = $props();
    let description = $state({});
    let descriptionProseMirrorEditor;
    let unsavedChanges = $state(false);
    let bypassUnsavedChangesConfirmation = false;
    let showExitConfirmationModal = $state(false);

    let isThereADueDate = $state(true);
    let datePickerInput;
    let datePicker;
    onMount(async function () {
        const { Datepicker } = await import('vanillajs-datepicker');
        datePicker = new Datepicker(
            datePickerInput
        )

        if (data.draft) {
            descriptionProseMirrorEditor.updateValueFromJson(
                JSON.parse(
                data?.classData?.assignmentDraftById?.descriptionProseMirrorJson
                )
            );
            if (data?.classData?.assignmentDraftById?.dueAt == null) {
                isThereADueDate = false;
            } else {
                datePicker.setDate(new Date(data?.classData?.assignmentDraftById?.dueAt));
            }
        } else if (!data.new) {
            descriptionProseMirrorEditor.updateValueFromJson(
                JSON.parse(
                data?.classData?.assignmentById?.descriptionProseMirrorJson
                )
            );
            if (data?.classData?.assignmentById?.dueAt == null) {
                isThereADueDate = false;
            } else {
                datePicker.setDate(new Date(data?.classData?.assignmentById?.dueAt));
            }
        }
    })

    beforeNavigate(function (navigation) {
        if (unsavedChanges && !bypassUnsavedChangesConfirmation) {
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
    })
    let title = $state("");
    let points;
    if (data.draft) {
        title = data?.classData?.assignmentDraftById?.title;
        points = data?.classData?.assignmentDraftById?.points;
    } else if (!data.new) {
        title = data?.classData?.assignmentById?.title;
        points = data?.classData?.assignmentById?.points;
    }
    function saveDraft() {
        if (data.new) {
            var request = fetch("/classes/api/graphql", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    query: `mutation saveAssignmentDraft(
                        $classId: ID!,
                        $title: String!,
                        $description: String!,
                        $points: Int!,
                        $dueAt: DateTime
                    ) {
                        createAssignmentDraft(
                            classId: $classId,
                            title: $title,
                            descriptionProseMirrorJson: $description,
                            points: $points,
                            dueAt: $dueAt
                        ) {
                            id
                        }
                    }`,
                    variables: {
                        "classId": data.classId,
                        "title": title ?? "Untitled Assignment",
                        "description": JSON.stringify(description),
                        "points": !isNaN(parseInt(points)) ?
                            parseInt(points) :
                            0,
                        "dueAt": isThereADueDate ?
                            datePicker.getDate() :
                            null
                    }
                })
            });
            request.catch(function (error) {
                console.error(error);
                alert("oops it like didnt work :(");
            });
            request.then(function (result) {
                var requestJson = result.json()
                requestJson.catch(function (error) {
                    console.error(error);
                    alert("oops it couldn't parse as json?")
                })
                requestJson.then(function (resultJson) {
                    if (resultJson.errors) {
                        console.error(resultJson);
                        alert("Oops there was an error");
                    } else {
                        unsavedChanges = false;
                        goto(
                            `/classes/c/${data.classId}/classwork`
                        );
                    }
                })
            });
        } else if (data.draft) {
            console.log(data.draftId)
            var request2 = fetch("/classes/api/graphql", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    query: `mutation updateAssignmentDraft(
                        $id: ID!,
                        $classId: ID!,
                        $title: String!,
                        $description: String!,
                        $points: Int!,
                        $dueAt: DateTime
                    ) {
                        updateAssignmentDraft(
                            id: $id,
                            classId: $classId,
                            title: $title,
                            descriptionProseMirrorJson: $description,
                            points: $points,
                            dueAt: $dueAt
                        ) {
                            id
                        }
                    }`,
                    variables: {
                        "id": data.draftId,
                        "classId": data.classId,
                        "title": title ?? "Untitled Assignment",
                        "description": JSON.stringify(description),
                        "points": !isNaN(parseInt(points)) ?
                            parseInt(points) :
                            0,
                        "dueAt": isThereADueDate ?
                            datePicker.getDate() :
                            null
                    }
                })
            });
            request2.catch(function (error) {
                console.error(error);
                alert("oops it like didnt work :(");
            });
            request2.then(function (result) {
                var requestJson = result.json()
                requestJson.catch(function (error) {
                    console.error(error);
                    alert("oops it couldn't parse as json?")
                })
                requestJson.then(function (resultJson) {
                    if (resultJson.errors) {
                        console.error(resultJson);
                        alert("Oops there was an error");
                    } else {
                        unsavedChanges = false;
                        goto(
                            `/classes/c/${data.classId}/classwork`
                        );
                    }
                })
            });
        }
    }
    function saveAssignment() {
        if (data.new || data.draft) {
            var request = fetch("/classes/api/graphql", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    query: `mutation postAssignment(
    $classId: ID!,
    $title: String!,
    $description: String!,
    $points: Int!,
    $dueAt: DateTime,
    ${data.draft ?
        "$draftId: ID!" :
        ""
    }
) {
    createAssignment(
        classId: $classId,
        title: $title,
        descriptionProseMirrorJson: $description,
        points: $points,
        dueAt: $dueAt
    ) {
        id
    }
    ${data.draft ?
        "deleteAssignmentDraft(id: $draftId)" :
        ""
    }
}`,
                    variables: {
                        "classId": data.classId,
                        "title": title ?? "Untitled Assignment",
                        "description": JSON.stringify(description),
                        "points": !isNaN(parseInt(points)) ?
                            parseInt(points) :
                            0,
                        "dueAt": isThereADueDate ?
                            datePicker.getDate() :
                            null,
                        "draftId": data.draftId
                    }
                })
            });
            request.catch(function (error) {
                console.error(error);
                alert("oops it like didnt work :(");
            });
            request.then(function (result) {
                var requestJson = result.json()
                requestJson.catch(function (error) {
                    console.error(error);
                    alert("oops it couldn't parse as json?")
                })
                requestJson.then(function (resultJson) {
                    if (resultJson.errors) {
                        console.error(resultJson);
                        alert("Oops there was an error");
                    } else {
                        unsavedChanges = false;
                        goto(
                            `/classes/c/${data.classId}/classwork`
                        );
                    }
                })
            });
        } else {
            var request2 = fetch("/classes/api/graphql", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    query: `mutation updateAssignment(
    $id: ID!,
    $classId: ID!,
    $title: String!,
    $description: String!,
    $points: Int!,
    $dueAt: DateTime
) {
    updateAssignment(
        id: $id,
        classId: $classId,
        title: $title,
        descriptionProseMirrorJson: $description,
        points: $points,
        dueAt: $dueAt
    ) {
        id
    }
}`,
                    variables: {
                        "id": data.assignmentId,
                        "classId": data.classId,
                        "title": title ?? "Untitled Assignment",
                        "description": JSON.stringify(description),
                        "points": !isNaN(parseInt(points)) ?
                            parseInt(points) :
                            0,
                        "dueAt": isThereADueDate ?
                            datePicker.getDate() :
                            null
                    }
                })
            });
            request2.catch(function (error) {
                console.error(error);
                alert("oops it like didnt work :(");
            });
            request2.then(function (result) {
                var requestJson = result.json()
                requestJson.catch(function (error) {
                    console.error(error);
                    alert("oops it couldn't parse as json?")
                })
                requestJson.then(function (resultJson) {
                    if (resultJson.errors) {
                        console.error(resultJson);
                        alert("Oops there was an error");
                    } else {
                        unsavedChanges = false;
                        goto(
                            `/classes/c/${data.classId}/classwork`
                        );
                    }
                })
            });
        }
    }
</script>
<style>
.class-box {
    display: flex;
    gap: 0px;
    border-radius: 0.8rem;
}
.class-link {
    color: var(--fg-1);
}
.class-link:hover {
    color: var(--fg-0);
}
.flexbox-to-the-end {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
}
:global {
    .announcement p {
        margin-top: 0px;
    }
}
.top-container-split {
    display: grid;
    grid-template-rows: auto;
    grid-template-columns: 1fr 1fr;
}
.reasonable-title-size {
    font-size: 1.2rem;
    width: 40vw;
}
.reasonable-title-size::placeholder {
    font-size: 1.2rem;
}
@media only screen and (max-width: 1000px) {
    .reasonable-title-size {
        width: 100%;
    }
}
.input-thingy-container {
    display: flex;
    margin-top: 0.4rem;
    flex-direction: row;
    gap: 0.4rem;
    align-items: center;
    align-content: center;
}
.input-thingy {
    margin-top: 0px;
    max-width: 5rem;
}
.input-thingy-sameline-label {
    margin-top: 0px;
}
</style>
<svelte:head>
    <title>Quizfreely Classes</title>
</svelte:head>

<div class="grid page">
    <div class="content">
        <div class="flex" style="margin-top: 1rem;">
            <a href="/classes/c/{ data.classId }/{
                data.new || data.draft ?
                    "classwork" :
                    `assignments/${data.assignmentId}`
            }" class="button faint">
                <IconBackArrow /> Back
            </a>
        </div>
        <Noscript />
        <div>
            <h1 class="h3">{title}</h1>
            <div class="combo-select">
                <button class="left {
                    !isThereADueDate ? "selected" : ""
                }" onclick={() => isThereADueDate = false}>

                    <IconCheckmark class="combo-selected-icon" />
                    No due date
                </button>
                <button class="right {
                    isThereADueDate ? "selected" : ""
                }" onclick={() => isThereADueDate = true}>

                    <IconCheckmark class="combo-selected-icon" />
                    Select due date
                </button>
            </div>
            <div class="eh-datepicker-container {
                isThereADueDate ? "" : "hide"
            }">
            <input type="text" name="due-date" bind:this={datePickerInput} placeholder="Due date">
            </div>
            <div class="input-thingy-container" style="margin-top: 1rem;">
                <input type="text" class="input-thingy" placeholder="100" bind:value={points} oninput={() => unsavedChanges = true}>
                <span class="input-thingy-sameline-label">points</span>
            </div>
            <ProseMirrorEditor placeholder="Description" bind:value={description} bind:this={descriptionProseMirrorEditor} oninputcallback={() => unsavedChanges = true}></ProseMirrorEditor>
            <div style="display: flex; gap: 1rem; flex-direction: row; justify-items: flex-end; justify-content: flex-end;">
                <a href="/classes/c/{ data.classId }/{
                    data.new || data.draft ?
                        "classwork" :
                        `assignments/${data.assignmentId}`
                    }"
                    class="button alt"
                    style="margin-top: 0px;"
                >Cancel</a>
                <!-- <button class="alt" style="margin-top: 0px;"> -->
                <!--     <IconClock></IconClock> -->
                <!--     Schedule -->
                <!-- </button> -->
                <button style="margin-top: 0px;" onclick={saveAssignment}>
                    <IconCheckmark></IconCheckmark>
                    {#if data.new || data.draft}
                        Post
                    {:else}
                        Save
                    {/if}
                </button>
            </div>
            <!-- <p style="white-space: pre-wrap;"> -->
            <!-- {JSON.stringify( -->
            <!--     data.classData, -->
            <!--     null, -->
            <!--     4 -->
            <!-- )} -->
            <!-- </p> -->
        </div>
            {#if showExitConfirmationModal}
            <div class="modal" transition:fade={{ duration: 200 }}>
              <div class="content">
                <h4>You have unsaved changes</h4>
                <div class="flex">
                  <button onclick={function () { showExitConfirmationModal = false; }}>Keep Editing</button>
                  <button class="button ohno" data-sveltekit-preload-data="false" onclick={function () {
                    bypassUnsavedChangesConfirmation = true;
                    goto(data.new || data.draft ?
                        `/classes/c/${data.classId}/classwork` :
                        `/classes/c/${data.classId}/assignments/${data.assignmentId}`
                    );
                  }}>
                    <IconTrash />
                    Discard
                  </button>
                </div>
              </div>
            </div>
            {/if}
    </div>
</div>

