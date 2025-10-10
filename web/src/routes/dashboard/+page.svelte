<script>
    import Noscript from "$lib/components/Noscript.svelte";
    import StudysetList from "$lib/components/StudysetList.svelte";
    import FolderPicker from "$lib/components/FolderPicker.svelte";
    import IconPlus from "$lib/icons/Plus.svelte";
    import FolderIcon from "$lib/icons/Folder.svelte";
    import BookmarkIcon from "$lib/icons/Bookmark.svelte";

    let { data } = $props();
    let showFolderPicker = $state(false);
</script>

<svelte:head>
  <title>Quizfreely</title>
</svelte:head>

<Noscript />
<div>
    {#if !data.authed}
        <p id="dashboard-noaccount-alert" class="fg0">
            You're not signed in, so your sets will be saved locally (on your device)
        </p>
    {/if}
    <div class="flex">
        <a href="/studyset/create" class="button">
            <IconPlus />
            Create new
        </a>
    </div>

    {#snippet emptyMsg()}
        <div class="box flex center-h center-v">
            <div>Tap "create new" to create a studyset</div>
        </div>
    {/snippet}
    {#snippet cloudDropdownContent(studyset)}
        {#if studyset?.folder}
            <button><FolderIcon></FolderIcon> Change Folder</button>
        {:else}
            <button onclick={() => console.log(studyset)}><FolderIcon></FolderIcon> Add to Folder</button>
        {/if}
    {/snippet}
    {#snippet savedDropdownContent(studyset)}
        {#if studyset?.folder}
            <button><FolderIcon></FolderIcon> Change Folder</button>
        {:else}
            <button onclick={() => console.log(studyset)}><FolderIcon></FolderIcon> Add to Folder</button>
        {/if}
        <button onclick={() => console.log(studyset)}>
            <BookmarkIcon></BookmarkIcon> Unsave
        </button>
    {/snippet}
    <StudysetList
        {data}
        cloudLinkTemplateFunc={(id) => `/studysets/${id}`}
        localLinkTemplateFunc={(id) => `/studyset/local?id=${id}`}
        cloudEmptyMsg={emptyMsg}
        localEmptyMsg={emptyMsg}
        collapseCloud={true}
        collapseLocal={true}
        collapseSaved={true}
        showCloudDropdown={true}
        {cloudDropdownContent}
        showLocalDropdown={false}
        showSavedDropdown={true}
        {savedDropdownContent}
    ></StudysetList>
</div>
