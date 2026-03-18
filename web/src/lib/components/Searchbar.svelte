<script lang="ts">
    let props = $props();
    import { tick } from "svelte";
    import { slide } from "svelte/transition";
    import IconSearch from "$lib/icons/Search.svelte";
    
    let doIHaveContentToShow = $state(false);
    let autocompleteItems: { query: string }[] = $state([]);

    let searchbarInput: HTMLInputElement | undefined = $state();
    let wholeEntireContainer: HTMLFormElement | undefined = $state();
    let searchbarAutocomplete: HTMLDivElement | null = $state(null);
    function onSearchbarInput(event: Event) {
        const target = event.target as HTMLInputElement;
        if (target.value.length > 0 && target.value.length < 50) {
            fetch(
                "/api/v0/search-queries?q=" + encodeURIComponent(target.value)
            ).then(function (response) {
                response.json().then(function (responseJson) {
                    if (responseJson.data && responseJson.data.queries && responseJson.data.queries.length > 0) {
                        autocompleteItems = responseJson.data.queries;
                        setIfIHaveContentToShow(true);
                    } else {
                        setIfIHaveContentToShow(false);
                        autocompleteItems = [];
                    }
                }).catch(function (error) {
                    setIfIHaveContentToShow(false);
                    autocompleteItems = [];
                    console.error(error);
                })
            }).catch(function (error) {
                setIfIHaveContentToShow(false);
                autocompleteItems = [];
                console.error(error);
            })
        } else {
            setIfIHaveContentToShow(false);
            autocompleteItems = [];
        }
    }

    function setIfIHaveContentToShow(visibility: boolean) {
        doIHaveContentToShow = visibility;
        updateClickHandlerAfterVisibilityChange();
    }

    function updateClickHandlerAfterVisibilityChange() {
        tick().then(() => {
            if (doIHaveContentToShow && !gotOutsideClicked) {
                window.addEventListener("click", outsideClick);
            } else {
                window.removeEventListener("click", outsideClick);
            }
        });
    }

    let gotOutsideClicked = $state(false);
    function outsideClick(e: MouseEvent) {
        if (wholeEntireContainer && !wholeEntireContainer.contains(e.target as Node)) {
            gotOutsideClicked = true;
            window.removeEventListener("click", outsideClick);
        }
    }
    function resetOutsideClick() {
        gotOutsideClicked = false;
        updateClickHandlerAfterVisibilityChange()
    }
</script>

<form action="/search" method="get" class="searchbar with-raw-autocomplete" style="margin-bottom: 0px; box-shadow: 0px 1px 2px 1px var(--button-box-shadow-color);" bind:this={wholeEntireContainer}>
    <IconSearch class="searchbar-icon" />
    <input type="text"
        name="q"
        bind:this={searchbarInput}
        placeholder="Search"
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
        value={ props.query ?? "" }
        oninput={onSearchbarInput}
        onfocus={resetOutsideClick}
    />
    {#if doIHaveContentToShow && !gotOutsideClicked}
        <div bind:this={searchbarAutocomplete} class="searchbar-raw-autocomplete" style="z-index: 11;" transition:slide={{duration:200}}>
            {#each autocompleteItems as item}
                <a href="/search?q={encodeURIComponent(item?.query)}" transition:slide={{duration:200}}>
                    {item.query}
                </a>
            {/each}
        </div>
    {/if}
</form>
