<script>
    import Noscript from "$lib/components/Noscript.svelte";
    import { onMount } from "svelte";
    import { invalidateAll } from '$app/navigation';
    import ProseMirrorEditor from "$lib/proseMirrorEditor.svelte";
    import { fancyTimestamp } from "$lib/fancyTimestamp.js";
    let { data } = $props();
    let newAnnouncementContent = $state({});
    let announcementProseMirrorEditor;
    onMount(function () {
        if (window.localStorage) {
            const hourFormat = localStorage.getItem("quizfreely:settings.hourFormat");
            if (hourFormat == "24h") {
                fancyTimestamp.hours = 24;
            } else if (hourFormat == "12h") {
                fancyTimestamp.hours = 12;
            }
        }
        for (
            let index = 0;
            index < data?.classData?.classById?.announcements?.length;
            index++
        ) {
            console.log("?")
            console.log("?")
            console.log("?")
            if (
                data.classData.classById.announcements[index].createdAt ==
                    data.classData.classById.announcements[index].updatedAt
            ) {
                data.classData.classById.announcements[index].renderedTimestamp =
                    fancyTimestamp.format(
                        data.classData.classById.announcements[index].createdAt
                    );
            } else {
                data.classData.classById.announcements[index].renderedTimestamp =
                    fancyTimestamp.format(
                        data.classData.classById.announcements[index].createdAt
                    ) + " · updated " + fancyTimestamp.format(
                        data.classData.classById.announcements[index].updatedAt
                    )
            }
        }
    })
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
                        "classId": data.classId,
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
    {#each data?.classData?.classById?.announcements as announcement}
        {#if announcement.safeRenderedHtml}
        <div class="box announcement">
            <p>{announcement.user.displayName} · {announcement.renderedTimestamp}</p>
            {@html announcement.safeRenderedHtml}
        </div>
        {/if}
    {/each}
    <p style="white-space: pre-wrap;">
    {JSON.stringify(
        data.classData,
        null,
        4
    )}
    </p>
</div>

