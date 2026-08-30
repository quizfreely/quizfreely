<script>
    import { studysetSelection } from "$lib/studyset-selection.svelte.js";
    import { onMount } from "svelte";
    import { goto, replaceState } from "$app/navigation";
    import { page } from "$app/state";
    import { idbApiLayer } from "$lib/idb-api-layer";
    import TermsTable from "$lib/components/TermsTable.svelte";
    import Flashcards from "$lib/components/Flashcards.svelte";
    import StudysetLinkBox from "$lib/components/StudysetLinkBox.svelte";
    import GridIcon from "$lib/icons/AppsGrid.svelte";
    import GraphIcon from "$lib/icons/ChartGraphLine.svelte";
    import PTIcon from "$lib/icons/PracticeTestChecklist.svelte";
    import TrashIcon from "$lib/icons/Trash.svelte";
    import AngleUpIcon from "$lib/icons/AngleUp.svelte"
    import AngleDownIcon from "$lib/icons/AngleDown.svelte"
    import FullscreenIcon from "$lib/icons/FullscreenMaximize.svelte"
    import PlusIcon from "$lib/icons/Plus.svelte"
    let { data } = $props();
    let currentCloudIds = $state([...data.cloudIds]);
    let currentLocalIds = $state([...data.localIds]);
    let studysets = $state(data.studysets?.filter?.(s => s != null) ?? []);
    const COLLAPSE_LEN = 3;
    let collapsed = $state(true);
    let displayedStudysets = $derived(collapsed ? studysets.slice(0, COLLAPSE_LEN) : studysets);
    let terms = $derived(studysets.flatMap(s => s?.terms).filter(t => t != null));
    onMount(() => {
        (async () => {
            if (currentLocalIds.length > 0) {
                studysets.push(...(await idbApiLayer.getStudysetsByIds(currentLocalIds))?.filter?.(s => s != null) ?? []);
            }
        })();
    });

    /* idSearchParams is URL search component WITHOUT starting question mark (`?`) */
    const idSearchParams = $derived([
        ...currentCloudIds.map((id) => `studyset=${id}`),
        ...currentLocalIds.map((id) => `localStudyset=${id}`),
    ].join("&"))
</script>
<div class="grid page" style="padding-top: 1rem;">
    <div class="content">
        <div class="caption-size">
            <div class="flex" style="align-items: center; justify-content: space-between;">
                <div>
                    <p class="h4" style="margin-bottom: 0px; font-size: 1.8rem;">{currentCloudIds.length + currentLocalIds.length} {currentCloudIds.length + currentLocalIds.length == 1 ? "Studyset" : "Studysets"}</p>
                    <p class="fg0" style="margin-top: 0.2rem; font-size: 1.2rem;">{terms.length} {terms.length == 1 ? "Total Term" : "Total Terms"}</p>
                </div>
                <button onclick={() => {
                    studysetSelection.replaceSelection({
                        cloudIds: currentCloudIds,
                        localIds: currentLocalIds,
                    });
                    goto("/dashboard");
                }}><PlusIcon></PlusIcon> Add More</button>
            </div>
        <div class="grid list" style="margin-bottom: 0px;">
        {#each displayedStudysets as studyset, index}
            <StudysetLinkBox {studyset} linkTemplateFunc={
                (id) => id?.includes?.("-") ?
                    `/studysets/${id}` : `/studyset/local?id=${id}`
            } showDropdown={true} ignoreSelection={true}>
                {#snippet dropdownContent(studyset, hideDropdown)}
                    <button class="ohno" onclick={() => {
                        if (studyset.id?.includes?.("-")) {
                            currentCloudIds = currentCloudIds.filter(id => id != studyset.id);
                            studysetSelection.deselect({ cloudId: studyset.id });
                        } else {
                            currentLocalIds = currentLocalIds.filter(id => id != studyset.id);
                            studysetSelection.deselect({ localId: studyset.id });
                        }
                        studysets.splice(index, 1); /* splice studysets because displayedStudysets is derived from studysets */
                        replaceState(`?${idSearchParams}`, page.state);
                        hideDropdown();
                    }}>
                        <TrashIcon />
                        Remove
                    </button>
                {/snippet}
            </StudysetLinkBox>
        {/each}
        </div>
        {#if studysets.length > COLLAPSE_LEN}
        <div class="flex center" style="margin-top: 0.6rem;">
            <button class="faint" onclick={() => collapsed = !collapsed}>
                {#if collapsed}
                    <AngleDownIcon /> Show All
                {:else}
                    <AngleUpIcon /> Collapse
                {/if}
            </button>
        </div>
        {/if}
        </div>
        <div style={studysets.length > COLLAPSE_LEN ? "" : "margin-top: 3rem;"}>
        <Flashcards {terms} >
            {#snippet captionEnd()}
                <a href={`/flashcards?${idSearchParams}`} class="button faint" aria-label="Fullscreen Flashcards">
                    <FullscreenIcon></FullscreenIcon>
                </a>
            {/snippet}
        </Flashcards>
        </div>
        <div class="grid list caption">
            <button onclick={() => {
                studysetSelection.clearSelection();
                goto(`/match?${idSearchParams}`);
            }} class="alt">
                <GridIcon />
                Match
            </button>
            <button onclick={() => {
                studysetSelection.clearSelection();
                goto(`/practice-test?${idSearchParams}`);
            }} class="alt">
                <PTIcon />
                Practice Test
            </button>
            <button onclick={() => {
                studysetSelection.clearSelection();
                goto(`/stats?${idSearchParams}`);
            }} class="alt">
                <GraphIcon />
                Progress &amp; Stats
            </button>
        </div>
        <TermsTable {terms} class="caption" />
    </div>
</div>
