<script lang="ts">
    import StudysetList from "$lib/components/StudysetList.svelte";
    import BackIcon from "$lib/icons/BackArrow.svelte";

    let { data }: { data: any } = $props();
</script>

{#snippet placeholderSnippet()}
{/snippet}
{#snippet placeholderFunc(_: any)}
{/snippet}

<div class="grid page">
    <div class="content">
        <!-- <div class="flex"> -->
        <!--     <a href="/host" class="button faint"> -->
        <!--         <BackIcon></BackIcon> -->
        <!--         Back -->
        <!--     </a> -->
        <!-- </div> -->
        <p>Select a studyset:</p>
        {#snippet emptyMsg()}
            <div class="box flex center-h center-v">
                <div class="text fg0">You have no studysets</div>
            </div>
        {/snippet}
        <StudysetList
            {data}
            cloudLinkTemplateFunc={
                (id: string) => `/host?studysetId=${id}`
            }
            localLinkTemplateFunc={
                (id: string | number) => `/host?localId=${id}`
            }
            cloudEmptyMsg={emptyMsg}
            localEmptyMsg={emptyMsg}
            hideTypeWhenCloudEmptyAndLocalExists={true}
            cloudDropdownContent={placeholderSnippet}
            localDropdownContent={placeholderSnippet}
            savedDropdownContent={placeholderSnippet}
            topMenu={placeholderSnippet}
            folderMenu={placeholderSnippet}
            onFolderEnter={placeholderFunc}
            onFolderExit={placeholderFunc}
        >
        </StudysetList>
    </div>
</div>
