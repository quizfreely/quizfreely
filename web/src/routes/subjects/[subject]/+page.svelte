<script lang="ts">
    import StudysetLinkBox from "$lib/components/StudysetLinkBox.svelte";
    import BackIcon from "$lib/icons/BackArrow.svelte";
    import BookmarkIcon from "$lib/icons/Bookmark.svelte";
    import AngleRightIcon from "$lib/icons/AngleRight.svelte";
    import ArrowLeftIcon from "$lib/icons/ArrowLeft.svelte";
    import ArrowRightIcon from "$lib/icons/ArrowRight.svelte";
    import { getClientSdk } from "$lib/graphql/sdk";
    let { data }: { data: any } = $props();
    const sdk = getClientSdk();
    const categoryName = ({
        LANG: "World Languages",
        SOCIAL_STUDIES: "Social Studies",
        STEM: "STEM",
        MATH: "Math",
        LA: "Language Arts",
    } as any)?.[data?.subject?.category];
    const categoryPath = ({
        LANG: "languages",
        SOCIAL_STUDIES: "social-studies",
        STEM: "stem",
        MATH: "math",
        LA: "language-arts",
    } as any)?.[data?.subject?.category];
</script>

<div class="grid page">
    <div class="content">
        <div class="flex compact-gap" style="align-items: center;">
            <a class="button faint" href="/explore"> Explore </a>
            <AngleRightIcon class="text fg0"></AngleRightIcon>
            <a class="button faint" href="/categories/{categoryPath}">
                {categoryName}
            </a>
        </div>
        <h3>{data?.subject?.name}</h3>
        {#snippet dropdownContent(studyset: any, hide: () => void)}
            {#if studyset?.saved}
                <button
                    onclick={async () => {
                        try {
                            const json = await sdk.UnsaveStudyset({
                                id: studyset?.id,
                            });
                            if (json?.unsaveStudyset) {
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
                            const json = await sdk.SaveStudyset({
                                id: studyset?.id,
                            });
                            if (json?.saveStudyset) {
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
