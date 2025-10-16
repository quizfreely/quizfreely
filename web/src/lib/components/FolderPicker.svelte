<script>
    import { onMount } from "svelte";
    import { fade, slide } from "svelte/transition";
    import CloseXMarkIcon from "$lib/icons/CloseXMark.svelte";
    import FolderIcon from "$lib/icons/Folder.svelte";
    let { closeCallback, selectCallback, errMsg, showNoneOption, noneCallback } = $props();
    let folders = $state([]);
    let showErrMsg = $state(false);
    let showActionErrMsg = $state(false);
    let showCreateErrMsg = $state(false);
    let newFolderName = $state("");
    onMount(async () => {
        try {
            const raw = await fetch(`/api/graphql`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    query: `{
    myFolders {
        id
        name
    }
}`
                })
            });
            const resp = await raw.json();
            if (resp?.data) {
                folders = resp.data.myFolders ?? [];
            } else {
                console.error("No data property in json response: ", resp);
                showErrMsg = true;
            }
        } catch (err) {
            console.error("Error loading folders: ", err);
            showErrMsg = true;
        }
    })

    async function newFolderButtonOnclick() {
        const folderName = newFolderName;
        newFolderName = "";
        showCreateErrMsg = false;
        try {
            const raw = await fetch(`/api/graphql`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    query: `mutation ($name: String!) {
    createFolder(name: $name) {
        id
    }
}`,
                    variables: {
                        name: folderName
                    }
                })
            });
            const resp = await raw.json();
            if (resp?.data?.createFolder?.id) {
                folders.push({
                    id: resp?.data?.createFolder?.id,
                    name: folderName
                })
            } else {
                console.error("Unsuccessful json response: ", resp);
                showCreateErrMsg = true;
            }
        } catch (err) {
            console.error("Error creating folder: ", err);
            showCreateErrMsg = true;
        }
    }
</script>
<div class="modal" transition:fade={{ duration: 200 }}>
    <div class="content" style="padding-top: 0.6rem;">
        <div class="flex" style="justify-content: space-between; align-items: center;">
            <span>Select a folder:</span>
            <button class="icon-only-button" onclick={closeCallback}>
                <CloseXMarkIcon></CloseXMarkIcon>
            </button>
        </div>
        {#if showActionErrMsg}
            {@render errMsg?.()}
        {:else if showErrMsg}
            <div class="box ohno" transition:slide={{duration: 400}}>
                <p>Error while loading folders :(</p>
            </div>
        {/if}
        <div class="flex" style="gap: 0.6rem; flex-direction: column; flex-wrap: nowrap; max-height: 50vh; overflow-y: auto; margin-top: 0.6rem;">
            {#if showNoneOption && folders?.length > 0}
            <button class="button-box" onclick={() => noneCallback(
                (show) => showActionErrMsg = show
            )}>
                None
            </button>
            {/if}
            {#each folders as folder}
                <button class="button-box" style="text-align: start; display: flex; align-items: center; justify-content: start; gap: 0.6rem;" onclick={
                    () => selectCallback(
                        folder,
                        (show) => showActionErrMsg = show
                    )
                }>
                    <FolderIcon></FolderIcon>
                    {folder.name}
                </button>
            {:else}
                <div class="box">
                    No folders
                </div>
            {/each}
        </div>
        <p>Create a new folder?</p>
        <div class="flex" style="margin-top: 0.6rem;">
            <input type="text" placeholder="Folder Name" bind:value={newFolderName} onkeyup={e => {
                if (e.key == "Enter") {
                    newFolderButtonOnclick();
                }
            }}>
            <button onclick={newFolderButtonOnclick}>Create</button>
        </div>
        {#if showCreateErrMsg}
            <div class="box ohno" transition:slide={{duration: 400}}>
                <p>Error creating folder :(</p>
            </div>
        {/if}
  </div>
</div>
