<script>
    import { studysetSelection } from "$lib/studyset-selection.svelte.js";
    import { onMount } from "svelte";
    import StudysetLinkBox from "$lib/components/StudysetLinkBox.svelte";
    import GridIcon from "$lib/icons/AppsGrid.svelte";
    import GraphIcon from "$lib/icons/ChartGraphLine.svelte";
    import PTIcon from "$lib/icons/PracticeTestChecklist.svelte";
    import TrashIcon from "$lib/icons/Trash.svelte";
    let { data } = $props();
    let currentCloudIds = [...data.cloudIds];
    let currentLocalIds = [...data.localIds];
    let studysets = $state(data.studysets?.filter?.(s => s != null) ?? []);
    let terms = $derived(studysets.flatMap(s => s?.terms).filter(t => t != null));
    onMount(() => {
        studysetSelection.clearSelection();
    });
</script>
<div class="grid page" style="padding-top: 2rem;">
    <div class="content">
        <p class="h4" style="margin-bottom: 0px; font-size: 1.8rem;">{currentCloudIds.length + currentLocalIds.length} {currentCloudIds.length + currentLocalIds.length == 1 ? "Studyset" : "Studysets"}</p>
        <p class="fg0" style="margin-top: 0.2rem; font-size: 1.2rem;">{terms.length} {terms.length == 1 ? "Total Term" : "Total Terms"}</p>
        <div class="grid list">
        {#each studysets as studyset, index}
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
        <div class="grid list">
            <a href={`/match?${[
                ...currentCloudIds.map((id) => `studyset=${id}`),
                ...currentLocalIds.map((id) => `localStudyset=${id}`),
            ].join("&")}`} class="button alt">
                <GridIcon />
                Match
            </a>
            <a href={`/practice-test?${[
                ...currentCloudIds.map((id) => `studyset=${id}`),
                ...currentLocalIds.map((id) => `localStudyset=${id}`),
            ].join("&")}`} class="button alt">
                <PTIcon />
                Practice Test
            </a>
            <a href={`/stats?${[
                ...currentCloudIds.map((id) => `studyset=${id}`),
                ...currentLocalIds.map((id) => `localStudyset=${id}`),
            ].join("&")}`} class="button alt">
                <GraphIcon />
                Progress &amp; Stats
            </a>
        </div>
    </div>
</div>
