<script>
    import { onMount } from "svelte";
    import { fade, slide } from "svelte/transition";
    import CloseXMarkIcon from "$lib/icons/CloseXMark.svelte";
    import FolderIcon from "$lib/icons/Folder.svelte";
    let { closeCallback, selectCallback } = $props();
    let folders = $state([]);
    let showErrMsg = $state(false);
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
</script>
<div class="modal" transition:fade={{ duration: 200 }}>
    <div class="content" style="padding-top: 0.6rem;">
        <div class="flex" style="justify-content: space-between; align-items: center;">
            <span>Select a folder:</span>
            <button class="icon-only-button" onclick={closeCallback}>
                <CloseXMarkIcon></CloseXMarkIcon>
            </button>
        </div>
        {#if showErrMsg}
            <div class="box ohno" transition:slide={{duration: 400}}>
                <p>Error while loading folders :(</p>
            </div>
        {/if}
        <div class="flex" style="flex-direction: column; flex-wrap: nowrap; max-height: 50vh; overflow-y: auto; margin-top: 0.6rem;">
            {#each folders as folder}
                <button class="button-box" style="text-align: start; display: flex; align-items: center; justify-content: start; gap: 0.6rem;" onclick={() => selectCallback(folder.id)}>
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
            <input type="text" placeholder="Folder Name" bind:value={newFolderName}>
            <button onclick={async () => {
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
            }}>Create</button>
        </div>
        {#if showCreateErrMsg}
            <div class="box ohno" transition:slide={{duration: 400}}>
                <p>Error creating folder :(</p>
            </div>
        {/if}
  </div>
</div>
