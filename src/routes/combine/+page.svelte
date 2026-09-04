<script>
    import { studysetSelection } from "$lib/studyset-selection.svelte.js";
    import { onMount } from "svelte";
    import { goto, replaceState } from "$app/navigation";
    import { page } from "$app/state";
    import { idbApiLayer } from "$lib/idb-api-layer";
    import { slide } from "svelte/transition"
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
    import SearchIcon from "$lib/icons/Search.svelte"
    let { data } = $props();
    let currentCloudIds = $state([...data.cloudIds]);
    let currentLocalIds = $state([...data.localIds]);
    let studysets = $state(data.studysets?.filter?.(s => s != null) ?? []);
    const COLLAPSE_LEN = 3;
    let collapsed = $state(true);
    const displayedStudysets = $derived(collapsed ? studysets.slice(0, COLLAPSE_LEN) : studysets);
    const terms = $derived(studysets.flatMap(s => s?.terms).filter(t => t != null));
    let localStudysetsLoaded = $state(false);
    let objectUrls = [];
    onMount(() => {
        if (studysetSelection.cloudIds.size + studysetSelection.localIds.size == 0) {
            studysetSelection.replaceSelection({
                cloudIds: currentCloudIds,
                localIds: currentLocalIds,
            });
        }
        (async () => {
            if (currentLocalIds.length > 0) {
                const localStudysets = await idbApiLayer.getStudysetsByIds(currentLocalIds, {
                    terms: {
                        termImageUrl: true,
                        defImageUrl: true
                    },
                    termsCount: true,
                });
                studysets.push(...(localStudysets?.filter?.(s => s != null) ?? []));
                localStudysetsLoaded = true;
                localStudysets?.forEach?.(s => s?.terms?.forEach?.(t => {
                    if (t?.termImageUrl != null) {
                        objectUrls.push(t.termImageUrl);
                    }
                    if (t?.defImageUrl != null) {
                        objectUrls.push(t.defImageUrl);
                    }
                }))
            }
        })();
        return () => {
            objectUrls.forEach(u => {
                URL.revokeObjectURL(u);
            });
        }
    });

    /* idSearchParams is URL search component WITHOUT starting question mark (`?`) */
    const idSearchParams = $derived([
        ...currentCloudIds.map((id) => `studyset=${id}`),
        ...currentLocalIds.map((id) => `localStudyset=${id}`),
    ].join("&"))
</script>
<div class="grid page" style="padding-top: 1rem;">
    <div class="content">
            <div class="flex caption-size gap-after-this-here-2" style="align-items: center; justify-content: space-between;">
                {#if currentCloudIds.length+currentLocalIds.length > 0}
                <div>
                    <p class="h4" style="margin-bottom: 0px; font-size: 1.8rem;">{currentCloudIds.length + currentLocalIds.length} {currentCloudIds.length + currentLocalIds.length == 1 ? "Studyset Selected" : "Studysets"}</p>
                    <p class="fg0" style="margin-top: 0.2rem; font-size: 1.2rem;">{terms.length} {terms.length == 1 ? "Total Term" : "Total Terms"}</p>
                </div>
                {:else}
                <div>
                    <p class="h4" style="margin-bottom: 0px; font-size: 1.8rem;">Select Multiple Studysets</p>
                    <p class="fg0" style="margin-top: 0.2rem; font-size: 1.2rem;">0 Studysets Selected</p>
                </div>
                {/if}
                <button onclick={() => {
                    studysetSelection.replaceSelection({
                        cloudIds: currentCloudIds,
                        localIds: currentLocalIds,
                    });
                    studysetSelection.setOverrideShow(true);
                    goto("/dashboard");
                }}><PlusIcon></PlusIcon> Add More</button>
            </div>
        {#if (currentLocalIds.length == 0 && currentCloudIds.length > studysets.length) ||
            (localStudysetsLoaded && currentCloudIds.length + currentLocalIds.length > studysets.length)}
            {const diff = $derived((currentCloudIds.length+currentLocalIds.length)-studysets.length)}
            <div class="box ohno caption-size gap-after-this-here-2" transition:slide={{duration:400}}>
                Failed to load {diff} {diff == 1 ? "studyset" : "studysets"} :(
            </div>
        {/if}
        {#if displayedStudysets.length > 0}
        <div class="grid list caption-size gap-after-this-here-3" style="margin-bottom: 0px;">
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
        {/if}
        {#if studysets.length > COLLAPSE_LEN}
        <div class="flex center caption-size" style="margin-top: 0.6rem;">
            <button class="faint" onclick={() => collapsed = !collapsed}>
                {#if collapsed}
                    <AngleDownIcon /> Show All
                {:else}
                    <AngleUpIcon /> Collapse
                {/if}
            </button>
        </div>
        {/if}
        <div class="gap-before-this-here">
            {#if studysets.length > 1}
            <Flashcards {terms} >
                {#snippet captionEnd()}
                    <button onclick={() => {
                        studysetSelection.clearSelection();
                        goto(`/flashcards?${idSearchParams}`);
                    }} class="faint" aria-label="Fullscreen Flashcards">
                        <FullscreenIcon></FullscreenIcon>
                    </button>
                {/snippet}
            </Flashcards>
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
            {:else}
                <div class="caption-size">
                    <p class="fg0">Practice tests, match activities, and flashcards with multiple studysets combined</p>
                    <p style="margin-top: 1.4rem;">Tap the "<b>Select Multiple</b>" button on <b>any page</b>: studysets, folders, search results, the dashboard, or any other page.</p>
                    <div class="flex" style="flex-direction: column; align-items: start;">
                        <button onclick={() => {
                            studysetSelection.replaceSelection({
                                cloudIds: currentCloudIds,
                                localIds: currentLocalIds,
                            });
                            studysetSelection.setOverrideShow(true);
                            goto("/dashboard");
                        }}><PlusIcon /> Select in Dashboard</button>
                        <button class="alt" onclick={() => {
                            studysetSelection.replaceSelection({
                                cloudIds: currentCloudIds,
                                localIds: currentLocalIds,
                            });
                            studysetSelection.setOverrideShow(true);
                            goto("/explore");
                        }}><SearchIcon /> Select in Search/Explore</button>
                    </div>
                </div>
            {/if}
        </div>
    </div>
</div>
<style>
    .gap-after-this-here-3 + .gap-before-this-here {
        margin-top: 3rem;
    }
    .gap-after-this-here-2 + .gap-before-this-here {
        margin-top: 2rem;
    }
</style>
