<script>
    import StudysetLinkBox from "$lib/components/StudysetLinkBox.svelte";
    import BackIcon from "$lib/icons/BackArrow.svelte";
    import BookmarkIcon from "$lib/icons/Bookmark.svelte";
    import AngleRightIcon from "$lib/icons/AngleRight.svelte";
    let { data } = $props();
    const categoryName = {
        LANG: "World Languages",
        SOCIAL_STUDIES: "Social Studies",
        STEM: "STEM",
        MATH: "Math",
        LA: "Language Arts",
    }?.[data?.subject?.category];
    const categoryPath = {
        LANG: "languages",
        SOCIAL_STUDIES: "social-studies",
        STEM: "stem",
        MATH: "math",
        LA: "language-arts",
    }?.[data?.subject?.category];
</script>

<div class="grid page">
    <div class="content">
        <div class="flex compact-gap" style="align-items: center;">
            <a class="button faint" href="/explore"> Explore </a>
            <AngleRightIcon></AngleRightIcon>
            <a class="button faint" href="/categories/{categoryPath}">
                {categoryName}
            </a>
        </div>
        <h3>{data?.subject?.name}</h3>
        {#snippet dropdownContent(studyset, hide)}
            {#if studyset?.saved}
                <button
                    onclick={async () => {
                        try {
                            const raw = await fetch("/api/graphql", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                    query: `mutation ($id: ID!) {
    unsaveStudyset(studysetId: $id)
}`,
                                    variables: {
                                        id: studyset?.id,
                                    },
                                }),
                            });
                            const json = await raw.json();
                            if (json?.data?.unsaveStudyset) {
                                studyset.saved = false;
                                hide();
                            } else {
                                console.log(
                                    "failed to unsave studyset: ",
                                    json,
                                );
                            }
                        } catch (err) {
                            console.log("error unsaving studyset: ", err);
                        }
                    }}
                >
                    <BookmarkIcon></BookmarkIcon> Unsave
                </button>
            {:else}
                <button
                    onclick={async () => {
                        try {
                            const raw = await fetch("/api/graphql", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                    query: `mutation ($id: ID!) {
    saveStudyset(studysetId: $id)
}`,
                                    variables: {
                                        id: studyset?.id,
                                    },
                                }),
                            });
                            const json = await raw.json();
                            if (json?.data?.saveStudyset) {
                                studyset.saved = true;
                                hide();
                            } else {
                                console.log("failed to save studyset: ", json);
                            }
                        } catch (err) {
                            console.log("error saving studyset: ", err);
                        }
                    }}
                >
                    <BookmarkIcon></BookmarkIcon> Save
                </button>
            {/if}
        {/snippet}
        {#if data?.subject?.studysets?.length > 0}
            <div class="grid list">
                {#each data?.subject?.studysets as studyset}
                    <StudysetLinkBox
                        {studyset}
                        linkTemplateFunc={(id) => `/studysets/${id}`}
                        showDropdown={data?.authed}
                        dropdownContent={data?.authed
                            ? dropdownContent
                            : undefined}
                    ></StudysetLinkBox>
                {/each}
            </div>
            <div
                class={data.subject.pageInfo?.hasNextPage &&
                data.subject.pageInfo?.hasPreviousPage
                    ? "combo-buttons"
                    : ""}
            >
                {#if data.subject.pageInfo?.hasPreviousPage}
                    <a
                        href="/subjects/{data.subject.id}?before={data.subject
                            .pageInfo.startCursor}"
                        class="button alt {data.subject.pageInfo?.hasNextPage
                            ? 'left'
                            : ''}"
                    >
                        <ArrowLeftIcon></ArrowLeftIcon> Previous
                    </a>
                {/if}
                {#if data.subject.pageInfo?.hasNextPage}
                    <a
                        href="/subjects/{data.subject.id}?after={data.subject
                            .pageInfo.endCursor}"
                        class="button alt {data.subject.pageInfo
                            ?.hasPreviousPage
                            ? 'right'
                            : ''}"
                    >
                        Next <ArrowRightIcon></ArrowRightIcon>
                    </a>
                {/if}
            </div>
        {:else}
            <div class="box">
                <p class="fg0">No studysets for this subject</p>
            </div>
        {/if}
    </div>
</div>
