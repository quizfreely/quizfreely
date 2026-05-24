<script>
    import { onMount } from "svelte";
    import { fade, slide } from "svelte/transition";
    import CloseXMarkIcon from "$lib/icons/CloseXMark.svelte";
    import SearchIcon from "$lib/icons/Search.svelte";
    let { closeCallback, selectCallback, errMsg } = $props();
    let subjects = $state([]);
    let showErrMsg = $state(false);
    let showActionErrMsg = $state(false);
    let searchQuery = $state("");
    onMount(async () => {
        try {
            const raw = await fetch(`/api/graphql`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    query: `{
    allSubjects {
        id
        name
    }
}`
                })
            });
            const resp = await raw.json();
            if (resp?.data) {
                subjects = resp.data.allSubjects ?? [];
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
    <div class="content" style="min-width: 0px; padding-top: 0.6rem;">
        <div class="flex" style="justify-content: space-between; align-items: center;">
            <span>Select a subject:</span>
            <button class="icon-only-button" onclick={closeCallback}>
                <CloseXMarkIcon></CloseXMarkIcon>
            </button>
        </div>
        {#if showActionErrMsg}
            {@render errMsg?.()}
        {:else if showErrMsg}
            <div class="box ohno" transition:slide={{duration: 400}}>
                <p>Error while loading subjects :(</p>
            </div>
        {/if}
        <div class="searchbar" style="margin-top: 0.4rem;">
            <SearchIcon class="searchbar-icon"></SearchIcon>
            <input type="text" placeholder="Search" bind:value={searchQuery}>
        </div>
        <div class="flex" style="gap: 0.6rem; flex-direction: column; flex-wrap: nowrap; max-height: 50vh; overflow-y: auto; margin-top: 1.4rem;">
            <button class="button-box" onclick={() => selectCallback(
                null,
                (show) => showActionErrMsg = show
            )}>
                No Subject
            </button>
            {#each subjects as subject}
                {#if subject.name.toLowerCase().startsWith(searchQuery)}
                <button class="button-box" style="text-align: start; display: flex; align-items: center; justify-content: start; gap: 0.6rem;" onclick={
                    () => selectCallback(
                        subject,
                        (show) => showActionErrMsg = show
                    )
                }>
                    {subject.name}
                </button>
                {/if}
            {/each}
        </div>
  </div>
</div>
