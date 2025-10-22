<script>
    let props = $props();
    import { slide } from "svelte/transition";
    import IconSearch from "$lib/icons/Search.svelte";
    
    let showAutocomplete = $state(false);
    let autocompleteItems = $state([]);

    let searchbarInput;
    let searchbarAutocomplete;
    function onSearchbarInput(event) {
        if (event.target.value.length > 0 && event.target.value.length < 50) {
            fetch(
                "/api/v0/search-queries?q=" + encodeURIComponent(event.target.value)
            ).then(function (response) {
                response.json().then(function (responseJson) {
                    if (responseJson.data && responseJson.data.queries && responseJson.data.queries.length > 0) {
                        autocompleteItems = responseJson.data.queries;
                        showAutocomplete = true;
                    } else {
                        showAutocomplete = false;
                        autocompleteItems = [];
                    }
                }).catch(function (error) {
                    showAutocomplete = false;
                    autocompleteItems = [];
                    console.error(error);
                })
            }).catch(function (error) {
                showAutocomplete = false;
                autocompleteItems = [];
                console.error(error);
            })
        } else {
            showAutocomplete = false;
            autocompleteItems = [];
        }
    }
</script>

<form action="/search" method="get" class="searchbar with-autocomplete" style="margin-bottom: 0px; box-shadow: 0px 1px 2px 1px var(--button-box-shadow-color);">
    <IconSearch class="searchbar-icon" />
    <input type="text"
        name="q"
        bind:this={searchbarInput}
        placeholder="Search"
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
        value={ props.query ?? "" }
        oninput={
            onSearchbarInput
        }
    />
    {#if showAutocomplete}
        <div bind:this={searchbarAutocomplete} class="searchbar-autocomplete" transition:slide={{duration:200}}>
            {#each autocompleteItems as item}
                <a href="/search?q={encodeURIComponent(item?.query)}" transition:slide={{duration:200}}>
                    {item.query}
                </a>
            {/each}
        </div>
    {/if}
</form>
