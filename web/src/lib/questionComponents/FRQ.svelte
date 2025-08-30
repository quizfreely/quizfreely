<script>
    import CheckmarkIcon from "$lib/icons/Checkmark.svelte";
    import XMarkIcon from "$lib/icons/CloseXMark.svelte";
    let { term, answerWith, viewOnly, showAccuracy, answerUpdateCallback, userMarkedCorrectCallback } = $props();
    let manuallyMarkedCorrect = $state(false);
    export function getQuestion() {
        if (answer == "") {
            console.log("Possibly Unanswered FRQ")
        }
        return {
            questionType: "FRQ",
            frq: {
                term: term,
                answerWith: answerWith,
                correct: manuallyMarkedCorrect ||
                    (answerWith == "DEF" ?
                        term.def == answer:
                        term.term == answer),
                userMarkedCorrect: manuallyMarkedCorrect,
                answeredString: answer,
            }
        }
    }
    export function isAnswered() {
        return answer != "";
    }
    let answer = $state("");
</script>
<div>
    <p class="fg0">Type the { answerWith == "DEF" ? "definition" : "term"}</p>
    <p class="h4" style="white-space: pre-wrap; margin-bottom: 0px;">{ answerWith == "DEF" ?
        term.term : term.def
    }</p>
    <div class="flex" style="align-content: center; align-items: center;">
        <input type="text" placeholder="{answerWith == "DEF" ?
            "Definition" : "Term"
        }" bind:value={answer} style="min-width: 16rem; field-sizing: content;" class="{showAccuracy ? (
            getQuestion().frq.correct ?
                "yay" : "ohno"
        ) : ""}" disabled={viewOnly} oninput={answerUpdateCallback}>
        {#if showAccuracy && getQuestion().frq.correct}
            <span class="yay"><CheckmarkIcon width="1.4rem" height="1.4rem"></CheckmarkIcon></span>
        {:else if showAccuracy}
            <span class="ohno"><XMarkIcon width="1.4rem" height="1.4rem"></XMarkIcon></span>
        {/if}
        {#if showAccuracy && !getQuestion().frq.correct}
            <div>
            <button class="faint" onclick={() => {
                manuallyMarkedCorrect = true;
                userMarkedCorrectCallback()
            }}>Manually mark as correct?</button>
            </div>
        {/if}
    </div>
</div>
