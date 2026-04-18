<script lang="ts">
    import { onMount } from "svelte";
    import { getClientSdk } from "$lib/graphql/sdk";
    import { fade, slide } from "svelte/transition";
    import CloseXMarkIcon from "$lib/icons/CloseXMark.svelte";
    import FolderIcon from "$lib/icons/Folder.svelte";
    let {
        closeCallback,
        selectCallback,
        errMsg,
        showNoneOption,
        noneCallback,
    }: {
        closeCallback: () => void,
        selectCallback: (folder: any, showErr: (show: boolean) => void) => void,
        errMsg?: any,
        showNoneOption?: boolean,
        noneCallback?: (showErr: (show: boolean) => void) => void,
    } = $props();
    let folders: { id: string, name: string }[] = $state([]);
    let showErrMsg = $state(false);
    let showActionErrMsg = $state(false);
    let showCreateErrMsg = $state(false);
    let newFolderName = $state("");
    const sdk = getClientSdk();
    onMount(async () => {
        try {
            const { data: resp } = await sdk.GetMyFolders();
            if (resp?.myFolders) {
                folders = (resp.myFolders.edges?.map((e: any) => e.node) ?? []) as { id: string, name: string }[];
            } else {
                console.error("No data in response: ", resp);
                showErrMsg = true;
            }
        } catch (err) {
            console.error("Error loading folders: ", err);
            showErrMsg = true;
        }
    });

    async function newFolderButtonOnclick() {
        const folderName = newFolderName;
        newFolderName = "";
        showCreateErrMsg = false;
        try {
            const { data: resp } = await sdk.CreateFolder({ name: folderName });
            if (resp?.createFolder?.id) {
                folders.push({
                    id: resp.createFolder.id,
                    name: folderName,
                });
            } else {
                console.error("Unsuccessful response: ", resp);
                showCreateErrMsg = true;
            }
        } catch (err) {
            console.error("Error creating folder: ", err);
            showCreateErrMsg = true;
        }
    }
</script>

<div class="modal" transition:fade={{ duration: 200 }}>
    <div class="content" style="min-width: 0px; padding-top: 0.6rem;">
        <div
            class="flex"
            style="justify-content: space-between; align-items: center;"
        >
            <span>Select a folder:</span>
            <button class="icon-only-button" onclick={closeCallback}>
                <CloseXMarkIcon></CloseXMarkIcon>
            </button>
        </div>
        {#if showActionErrMsg}
            {@render errMsg?.()}
        {:else if showErrMsg}
            <div class="box ohno" transition:slide={{ duration: 400 }}>
                <p>Error while loading folders :(</p>
            </div>
        {/if}
        <div
            class="flex"
            style="gap: 0.6rem; flex-direction: column; flex-wrap: nowrap; max-height: 50vh; overflow-y: auto; margin-top: 0.6rem;"
        >
            {#if showNoneOption && folders?.length > 0}
                <button
                    class="button-box"
                    onclick={() =>
                        noneCallback?.((show) => (showActionErrMsg = show))}
                >
                    None
                </button>
            {/if}
            {#each folders as folder}
                <button
                    class="button-box"
                    style="text-align: start; display: flex; align-items: center; justify-content: start; gap: 0.6rem;"
                    onclick={() =>
                        selectCallback(
                            folder,
                            (show) => (showActionErrMsg = show),
                        )}
                >
                    <FolderIcon></FolderIcon>
                    {folder.name}
                </button>
            {:else}
                <div class="box">No folders</div>
            {/each}
        </div>
        <p>Create a new folder?</p>
        <div class="flex" style="margin-top: 0.6rem;">
            <input
                type="text"
                placeholder="Folder Name"
                bind:value={newFolderName}
                onkeyup={(e) => {
                    if (e.key == "Enter") {
                        newFolderButtonOnclick();
                    }
                }}
            />
            <button onclick={newFolderButtonOnclick}>Create</button>
        </div>
        {#if showCreateErrMsg}
            <div class="box ohno" transition:slide={{ duration: 400 }}>
                <p>Error creating folder :(</p>
            </div>
        {/if}
    </div>
</div>
