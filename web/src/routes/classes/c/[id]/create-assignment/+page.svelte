<script>
    import Noscript from "$lib/components/Noscript.svelte";
    import { onMount } from "svelte";
    import { invalidateAll } from '$app/navigation';
    import ProseMirrorEditor from "$lib/proseMirrorEditor.svelte";
    import { DOMSerializer, Node } from "prosemirror-model";
    import { schema } from "$lib/proseMirrorSchema.js";
    import IconBackArrow from "$lib/icons/BackArrow.svelte";
    import IconCheckmark from "$lib/icons/Checkmark.svelte";
    let { data } = $props();
    let newAnnouncementContent = $state({});
    function renderAnnouncements(announcementsArray) {
        let result = [];
        if (announcementsArray) {
            for (
                let index = announcementsArray.length - 1;
                index >= 0;
                index--
            ) {
                try {
                    const contentJson = JSON.parse(
                        announcementsArray[index].contentProseMirrorJson
                    )
                    let div = document.createElement("div");
                    div.appendChild(DOMSerializer.fromSchema(schema).serializeFragment(
                        Node.fromJSON(schema, contentJson)
                    ));
                    result.push(div.innerHTML);
                } catch (error) {
                    console.log("Error rendering announcement prosemirror content:")
                    console.log(error);
                }
            }
        }
        return result;
    }
    let announcements = $derived(renderAnnouncements(
        data?.classData?.classById?.announcements
    ));
    let announcementProseMirrorEditor;
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
                <button class="alt" style="margin-top: 0px;">Save draft</button>
            </div>
        </div>
        <Noscript />
        <div>
            <input type="text" class="reasonable-title-size" placeholder="Title">
            <ProseMirrorEditor placeholder="Description"></ProseMirrorEditor>
            <div style="display: flex; gap: 1rem; flex-direction: row; justify-items: flex-end; justify-content: flex-end;">
                <button class="alt" style="margin-top: 0px;">Cancel</button>
                <button class="alt" style="margin-top: 0px;">Schedule</button>
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
    </div>
</div>

