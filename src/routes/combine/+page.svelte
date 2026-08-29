<script>
    import { studysetSelection } from "$lib/studyset-selection.svelte.js";
    import { onMount } from "svelte";
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
    let { data } = $props();
    let currentCloudIds = [...data.cloudIds];
    let currentLocalIds = [...data.localIds];
    let studysets = $state(data.studysets?.filter?.(s => s != null) ?? []);
    const COLLAPSE_LEN = 3;
    let collapsed = $state(true);
    let displayedStudysets = $derived(collapsed ? studysets.slice(0, COLLAPSE_LEN) : studysets);
    let terms = $derived(studysets.flatMap(s => s?.terms).filter(t => t != null));
    onMount(() => {
        studysetSelection.clearSelection();
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
<div class="grid page" style="padding-top: 2rem;">
    <div class="content">
        <div class="caption-size">
        <p class="h4" style="margin-bottom: 0px; font-size: 1.8rem;">{currentCloudIds.length + currentLocalIds.length} {currentCloudIds.length + currentLocalIds.length == 1 ? "Studyset" : "Studysets"}</p>
        <p class="fg0" style="margin-top: 0.2rem; font-size: 1.2rem;">{terms.length} {terms.length == 1 ? "Total Term" : "Total Terms"}</p>
        <div class="grid list" style="margin-bottom: 0px;">
        {#each displayedStudysets as studyset, index}
            <StudysetLinkBox {studyset} linkTemplateFunc={
                (id) => id?.includes?.("-") ?
                    `/studysets/${id}` : `/studyset/local?id=${id}`
            } showDropdown={true}>
                {#snippet dropdownContent()}
                    <button class="ohno" onclick={() => {
                        studyset.id
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
        <Flashcards {terms}>
            {#snippet captionEnd()}
                <a href={`/flashcards?${idSearchParams}`} class="button faint" aria-label="Fullscreen Flashcards">
                    <FullscreenIcon></FullscreenIcon>
                </a>
            {/snippet}
        </Flashcards>
        <div class="grid list caption">
            <a href={`/match?${idSearchParams}`} class="button alt">
                <GridIcon />
                Match
            </a>
            <a href={`/practice-test?${idSearchParams}`} class="button alt">
                <PTIcon />
                Practice Test
            </a>
            <a href={`/stats?${idSearchParams}`} class="button alt">
                <GraphIcon />
                Progress &amp; Stats
            </a>
        </div>
        <TermsTable {terms} />
    </div>
</div>
