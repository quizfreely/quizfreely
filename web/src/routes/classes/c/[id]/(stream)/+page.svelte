<script>
    import Noscript from "$lib/components/Noscript.svelte";
    import { onMount } from "svelte";
    import { invalidateAll } from '$app/navigation';
    import ProseMirrorEditor from "$lib/proseMirrorEditor.svelte";
    import { DOMSerializer, Node } from "prosemirror-model";
    import { schema } from "$lib/proseMirrorSchema.js";
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
</style>
<svelte:head>
    <title>Quizfreely Classes</title>
</svelte:head>

<Noscript />
<div style="margin-top: 0px;">
    <ProseMirrorEditor
        placeholder="Post an announcement"
        bind:this={announcementProseMirrorEditor}
        bind:value={newAnnouncementContent}
    ></ProseMirrorEditor>
    <div class="flexbox-to-the-end">
        <button onclick={function () {
            var request = fetch("/classes/api/graphql", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    query: `mutation postAnnouncement($classId: ID!, $content: String!) {
                        createAnnouncement(
                            classId: $classId,
                            contentProseMirrorJson: $content
                        ) {
                            id
                        }
                    }`,
                    variables: {
                        "classId": data.classData?.classById?.id,
                        "content": JSON.stringify(newAnnouncementContent)
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
                    announcementProseMirrorEditor.clearValue();
                })
                invalidateAll();
            });
        }}>Post</button>
    </div>
    {#each announcements as announcement}
        <div class="box announcement">
            {@html announcement}
        </div>
    {/each}
    <p style="white-space: pre-wrap;">
    {JSON.stringify(
        data.classData,
        null,
        4
    )}
    </p>
</div>

