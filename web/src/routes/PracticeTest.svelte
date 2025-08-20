<script>
    import { onMount } from "svelte";
    import idbApiLayer from "$lib/idb-api-layer/idb-api-layer.js";
    import BackIcon from "$lib/icons/BackArrow.svelte";
    import CheckmarkIcon from "$lib/icons/Checkmark.svelte";
    import { slide } from "svelte/transition";
    let { data } = $props();
    let terms = $state();

    function shuffleArray(ogArray) {
        let arr = [...ogArray];
        for (let index = arr.length - 1; index > 0; index--) {
            const randomIndex = Math.floor(Math.random() * (index + 1));
            [arr[index], arr[randomIndex]] = [arr[randomIndex], arr[index]];
        }
        return arr;
    }

    if (!data.local) {
        terms = data?.studyset?.terms;
    }
    onMount(() => {
        if (data.local) {
            (async () => {
                const studyset = await idbApiLayer.getStudysetById(data.localId, {
                    terms: {
                        progress: true
                    }
                })
                terms = studyset.terms;
            })();
        }
    })

    let eachRandom;
    function newEachRandom() {
        eachRandom = Math.random();
        return eachRandom;
    }

    function buttonBoxMultiSelectOnClick(e) {
        e.target.classList.toggle("selected");
    }
    let answerWithDef;
    let answerWithTerm;
    let answerWithBoth;
    function answerWithOnClick(e) {
        answerWithDef.classList.remove("selected");
        answerWithTerm.classList.remove("selected");
        answerWithBoth.classList.remove("selected");
        e.target.classList.add("selected");
    }

    let defaultQuestionsCount = $derived.by(() => {
        if (terms == null) {
            return 10;
        }
        if (terms.length >= 20) {
            return 20;
        }
        if (terms.length >= 10) {
            return 10;
        }
        return terms.length;
    });

    let showSetup = $state(true);
</script>
<div class="grid page">
    <div class="content">
        <div class="flex" style="margin-top: 1rem;">
            <a class="button faint" href={data.local ?
                `/studyset/local?id=${data.localId}` :
                `/studysets/${data.studysetId}`
            }><BackIcon></BackIcon> Back</a>
        </div>
        {#if showSetup}
            <div id="setup" transition:slide={{duration:400}}>
                <p class="h4">Practice Test</p>
                <p style="margin-top: 1rem;">Questions:</p>
                <div style="margin-top: 0.4rem;">
                <input type="text" placeholder={defaultQuestionsCount} style="max-width: 4rem;">
                </div>
                <p class="fg0" style="margin-top: 0.4rem;">({terms?.length ?? "?"} total terms in this studyset)</p>
                <p style="margin-top: 2rem;">Answer with:</p>
                <div class="flex" style="margin-top: 0.6rem;">
                    <button class="button-box selected" style="display: flex;" bind:this={answerWithDef} onclick={answerWithOnClick}>
                        <CheckmarkIcon class="button-box-selected-icon"></CheckmarkIcon>
                        Definition
                    </button>
                    <button class="button-box" style="display: flex;" bind:this={answerWithTerm} onclick={answerWithOnClick}>
                        <CheckmarkIcon class="button-box-selected-icon"></CheckmarkIcon>
                        Term
                    </button>
                    <button class="button-box" style="display: flex;" bind:this={answerWithBoth} onclick={answerWithOnClick}>
                        <CheckmarkIcon class="button-box-selected-icon"></CheckmarkIcon>
                        Both
                    </button>
                </div>
                <p style="margin-top: 2rem;">Question types:</p>
                <div style="display: grid; grid-template-columns: auto; justify-content: start; margin-top: 0.6rem;">
                    <button class="button-box selected" style="display: flex;" onclick={buttonBoxMultiSelectOnClick}>
                        <CheckmarkIcon class="button-box-selected-icon"></CheckmarkIcon>
                        Multiple Choice
                    </button>
                    <button class="button-box" style="display: flex; margin-top: 0.4rem;" onclick={buttonBoxMultiSelectOnClick}>
                        <CheckmarkIcon class="button-box-selected-icon"></CheckmarkIcon>
                        True/False
                    </button>
                    <button class="button-box selected" style="display: flex; margin-top: 0.4rem;" onclick={buttonBoxMultiSelectOnClick}>
                        <CheckmarkIcon class="button-box-selected-icon"></CheckmarkIcon>
                        Matching
                    </button>
                    <button class="button-box" style="display: flex; margin-top: 0.4rem;" onclick={buttonBoxMultiSelectOnClick}>
                        <CheckmarkIcon class="button-box-selected-icon"></CheckmarkIcon>
                        Free Response
                    </button>
                </div>
                <div class="flex" style="margin-top: 2rem;">
                    <button onclick={() => showSetup = false}><CheckmarkIcon></CheckmarkIcon> Start</button>
                </div>
            </div>
        {/if}
        <p style="white-space: pre-wrap">{JSON.stringify(terms, null, 4)}</p>
        {#each terms as term}
            {#if newEachRandom() < 0.5}
                e
            {:else}
                a
            {/if}
        {/each}
    </div>
</div>
