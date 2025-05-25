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
    let { data } = $props();
    let description = $state({});
    let unsavedChanges = false;
    let bypassUnsavedChangesConfirmation = false;
    let showExitConfirmationModal = $state(false);
    let showDraftSavedIndicator = $state(false);

    beforeNavigate(function (navigation) {
        if (unsavedChanges && !bypassUnsavedChangesConfirmation) {
            if (navigation.type !== "leave") {
                /* when navigation.type is NOT "leave",
                it's controlled by SvelteKit, so we can
                show our js confirmation modal */
                showExitConfirmationModal = true;
            }
            /* if navigation.type is "leave",
            then its controlled by the browser &
            the browser shows it's own native modal
            when we use `.cancel()` */
            navigation.cancel();

            /* our routes/+layout.svelte shows a progress bar
            if navigation takes too long, so we cancel the timer
            when we cancel navigation, so that it doesn't show */
            cancelNprogressTimeout();
        }
    })

    function saveDraft() {
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
                    $dueAt: DateTime!
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
                    "title": title,
                    "description": JSON.stringify(description),
                    "points": points,
                    "dueAt": dueAt
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
                showDraftSavedIndicator = true;
                unsavedChanges = false;
            })
        });
    }
</script>
<style>
.class-box {
    display: flex;
    gap: 0px;
    border-radius: 0.8rem;
}
.class-link {
    color: var(--fg1);
}
.class-link:hover {
    color: var(--fg0);
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
</style>
<svelte:head>
    <title>Quizfreely Classes</title>
</svelte:head>

<div class="grid page">
    <div class="content">
        <div class="top-container-split" style="margin-top: 1rem;">
            <div class="flex">
                <a href="/classes" class="button faint">
                    <IconBackArrow /> Back
                </a>
            </div>
            <div class="flex" style="margin-top: 0px; justify-items: flex-end; justify-content: flex-end;">
                {#if showDraftSavedIndicator && !unsavedChanges}
                <span class="fg0" style="margin-top: 0px;">
                    <IconCheckmark></IconCheckmark>
                    Draft saved
                </span>
                {/if}
                <button class="alt" style="margin-top: 0px;" onclick={saveDraft}>Save draft</button>
            </div>
        </div>
        <Noscript />
        <div>
            <input type="text" class="reasonable-title-size" placeholder="Title">
            <ProseMirrorEditor placeholder="Description" bind:value={description} oninputcallback={() => unsavedChanges = true}></ProseMirrorEditor>
            <div style="display: flex; gap: 1rem; flex-direction: row; justify-items: flex-end; justify-content: flex-end;">
                <button class="alt" style="margin-top: 0px;">Cancel</button>
                <button class="alt" style="margin-top: 0px;">
                    <IconClock></IconClock>
                    Schedule
                </button>
                <button style="margin-top: 0px;">
                    <IconCheckmark></IconCheckmark>
                    Post
                </button>
            </div>
            <p style="white-space: pre-wrap;">
            {JSON.stringify(
                data.classData,
                null,
                4
            )}
            </p>
        </div>
            {#if showExitConfirmationModal}
            <div class="modal" transition:fade={{ duration: 200 }}>
              <div class="content">
                <h4>Save changes?</h4>
                <div class="flex">
                  <button data-sveltekit-preload-data="false" onclick={saveButtonOrCreateButton}>
                    <IconCheckmark />
                    Save draft
                  </button>
                  <button onclick={function () { showExitConfirmationModal = false; }}>Keep Editing</button>
                  <button class="button ohno" data-sveltekit-preload-data="false" onclick={function () {
                    bypassUnsavedChangesConfirmation = true;
                    goto(data.new ?
                      "/dashboard" :
                      (data.local ?
                        "/studyset/local?id=" + data.localId :
                        "/studysets/" + data.studysetId
                      )
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

