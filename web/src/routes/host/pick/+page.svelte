<script>
    import StudysetList from "$lib/components/StudysetList.svelte";
    import BackIcon from "$lib/icons/BackArrow.svelte";

    let { data } = $props();
</script>
<div class="grid page">
    <div class="content">
        <div class="flex">
            <a href="/host" class="button faint">
                <BackIcon></BackIcon>
                Back
            </a>
        </div>
        {#snippet emptyMsg()}
            <div class="box flex center-h center-v">
                <div class="text fg0">No studysets here...</div>
            </div>
        {/snippet}
        <StudysetList
            {data}
            cloudLinkTemplateFunc={
                id => `/host?studysetId=${id}`
            }
            localLinkTemplateFunc={
                id => `/host?localId=${id}`
            }
            cloudEmptyMsg={emptyMsg}
            localEmptyMsg={emptyMsg}
            hideTypeWhenCloudEmptyAndLocalExists={true}
        >
        </StudysetList>
    </div>
</div>
