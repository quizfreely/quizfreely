<script>
    import Noscript from "$lib/components/Noscript.svelte";
    import { onMount } from "svelte";
    import { invalidateAll } from '$app/navigation';
    import ProseMirrorEditor from "$lib/proseMirrorEditor.svelte";
    import { DOMSerializer, Node } from "prosemirror-model";
    import { schema } from "$lib/proseMirrorSchema.js";
    let { data } = $props();
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
</style>
<svelte:head>
    <title>Quizfreely Classes</title>
</svelte:head>

<Noscript />
<div style="margin-top: 0px;">
    {#if data?.classData?.classById?.classCode}
    <p>Class code: <code>{data?.classData?.classById?.classCode}</code></p>
    {:else}
    <button class="alt" onclick={() => {
                            fetch("/classes/api/graphql", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({
                                    query: `mutation generateClassCode($classId: ID!) {
                                        generateClassCode(classId: $classId)
                                    }`,
                                    variables: {
                                        "classId": data.classId
                                    }
                                })
                            }).then(function (result) {
                                result.json().then(function (resultJson) {
                                    if (resultJson?.data?.generateClassCode) {
                                        window.location.reload();
                                    } else {
                                        alert("Error after successful API response");
                                    }
                                }).catch(function (error) {
                                    console.error(
                                        "Error parsing API response as JSON in generateClassCode",
                                        error
                                    );
                                    alert("Error in generateClassCode JSON");
                                })
                            }).catch(function (error) {
                                console.error(
                                    "Error creating class code",
                                    error
                                )
                                alert("Error in generateClassCode")
                            })
    }}>Generate class code</button>
    {/if}
    <p>
    {#if data?.classData?.classById?.teachers?.length == 1}
    {data?.classData?.classById?.teachers?.length} Teacher
    {:else}
    {data?.classData?.classById?.teachers?.length} Teachers
    {/if}
    </p>
    {#each data?.classData?.classById?.teachers as teacher}
        <div class="box">
        {teacher.displayName}
        </div>
    {/each}
    <p>
    {#if data?.classData?.classById?.students?.length == 1}
    {data?.classData?.classById?.students?.length} Student
    {:else}
    {data?.classData?.classById?.students?.length} Students
    {/if}
    </p>
    {#each data?.classData?.classById?.students as student}
        <div class="box">
            {student.displayName}
        </div>
    {/each}
    <!-- <p style="white-space: pre-wrap;"> -->
    <!-- {JSON.stringify( -->
    <!--     data.classData, -->
    <!--     null, -->
    <!--     4 -->
    <!-- )} -->
    <!-- </p> -->
</div>

