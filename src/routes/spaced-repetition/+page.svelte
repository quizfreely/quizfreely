<script>
    import { SvelteMap, SvelteSet } from "svelte/reactivity";
    import { onMount } from "svelte";
    import { idbApiLayer } from "$lib/idb-api-layer";
    import BackIcon from "$lib/icons/BackArrow.svelte";
    import SRSIcon from "$lib/icons/FlaskScienceSRS.svelte";
    import CheckmarkIcon from "$lib/icons/Checkmark.svelte";
    import FlashcardsIcon from "$lib/icons/Flashcards.svelte";
    import GridIcon from "$lib/icons/AppsGrid.svelte";
    let { data } = $props();
    let terms = new SvelteMap();
    let newTerms = new SvelteSet();
    let learningTerms = new SvelteSet();
    let reviewTerms = new SvelteSet();
    let relearningTerms = new SvelteSet();
    data.studysets.forEach(s => {
        s.terms.forEach(t => {
            if (t?.id == null) {
                return;
            }
            terms.set(t.id, t);
            switch (t?.fsrsCard?.state ?? "NEW") {
                case "NEW":
                    newTerms.add(t.id);
                    break;
                case "LEARNING":
                    learningTerms.add(t.id);
                    break;
                case "REVIEW":
                    reviewTerms.add(t.id);
                    break;
                case "RELEARNING":
                    relearningTerms.add(t.id);
                    break;
            }
        })
    });
    let objUrls = [];
    onMount(() => {
        if (data.localIds.length > 0) {
            (async () => {
                const localStudysets = await idbApiLayer.getStudysetsByIds(data.localIds, {
                    terms: {
                        progress: true,
                        termImageUrl: true,
                        defImageUrl: true
                    },
                });
            })();
        }
        return () => {
            objUrls.forEach(objUrl => {
                URL.revokeObjectURL(objUrl);
            });
        };
    })
</script>
<div class="grid page">
    <div class="content">
        <div>
            <a href={
                /* data.cloudIds.length+data.localIds.length is always > 0 because of +page.js */
                data.cloudIds.length + data.localIds.length > 1 ?
                    `/combine?${[
                        ...data.cloudIds.map((id) => `studyset=${id}`),
                        ...data.localIds.map((id) => `localStudyset=${id}`),
                    ].join("&")}` :
                    data.cloudIds.length == 1 ?
                        `/studysets/${data.cloudIds[0]}` :
                        `/studyset/local?id=${data.localIds[0]}`
            } class="button faint" style="justify-self: start;">
                <BackIcon />
                Back
            </a>
        </div>
        <div class="flex" style="justify-content: center; flex-wrap: nowrap;">
            <div class="min-and-max-width-here">
                <div class="flex" style="align-items: center; margin-top: 2rem; margin-bottom: 1rem; flex-wrap: nowrap;">
                    <SRSIcon width="2rem" height="2rem" />
                    <span class="h3" style="margin-bottom: 0px;">Spaced Repetition</span>
                </div>
                <div class="flex" style="align-items: center;">
                    <span style="font-size: 1.4rem;">
                        {terms.size} total terms
                        {#if data.cloudIds.length+data.localIds.length > 1}
                            <span class="fg0">from {data.cloudIds.length+data.localIds.length} studysets</span>
                        {/if}
                    </span>
                </div>
                <div class="box">
                <div class="flex" style="align-items: center; justify-content: space-between; flex-wrap: nowrap;">
                    <div class="flex" style="align-items: center; gap: 0.6rem; font-size: 1.2rem; flex-wrap: nowrap;">
                        <FlashcardsIcon width="1em" height="1em" style="color: color-mix(in srgb, var(--fg-1) 50%, var(--fg-0));" />
                        <span> Flashcards</span>
                    </div>
                    <button><CheckmarkIcon /> Start</button>
                </div>
                <div class="separator">or</div>
                <div class="flex" style="align-items: center; justify-content: space-between; flex-wrap: nowrap;">
                    <div class="flex" style="align-items: center; gap: 0.6rem; font-size: 1.2rem; flex-wrap: nowrap;">
                        <GridIcon width="1em" height="1em" style="color: color-mix(in srgb, var(--fg-1) 50%, var(--fg-0));" />
                        <span>Multiple Choice Questions</span>
                    </div>
                    <button><CheckmarkIcon /> Start</button>
                </div>
                </div>
                <!-- <button class="large" style="width: 100%;"> -->
                <!--     <CheckmarkIcon /> -->
                <!--     Start -->
                <!-- </button> -->
                <div style="margin-top: 3rem;">
                    <div class="box flex ohno" style="justify-content: space-between; color: color-mix(in srgb, var(--fg-1) 30%, var(--ohno)); {relearningTerms.size > 0 ? '' : 'opacity: 0.6;'}">
                        <span>Relearning</span>
                        <span>{relearningTerms.size} Terms</span>
                    </div>
                    <div class="box flex warn" style="justify-content: space-between; color: color-mix(in srgb, var(--fg-1) 30%, var(--warn)); {learningTerms.size > 0 ? '' : 'opacity: 0.6;'}">
                        <span>Learning</span>
                        <span>{learningTerms.size} Terms</span>
                    </div>
                    <div class="box flex yay" style="justify-content: space-between; color: color-mix(in srgb, var(--fg-1) 30%, var(--yay)); {reviewTerms.size > 0 ? '' : 'opacity: 0.6;'}">
                        <span>Review</span>
                        <span>{reviewTerms.size} Terms</span>
                    </div>
                    <div class="box flex" style="justify-content: space-between; color: color-mix(in srgb, var(--fg-1) 30%, var(--main)); border-color: var(--main); {newTerms.size > 0 ? '' : 'opacity: 0.6;'}">
                        <span>New</span>
                        <span>{newTerms.size} Terms</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<style>
    @media only screen and (min-width: 800px) {
        .min-and-max-width-here {
            width: 25rem;
        }
    }
</style>
