<script>
    import CheckmarkIcon from "$lib/icons/Checkmark.svelte";
    import XMarkIcon from "$lib/icons/CloseXMark.svelte";
    let { term, answerWith, showAccuracy } = $props();
    export function getQuestion() {
        if (answer == "") {
            console.log("Possibly Unanswered FRQ")
        }
        return {
            questionType: "FRQ",
            frq: {
                term: term,
                answerWith: answerWith,
                correct: answerWith == "DEF" ?
                    term.def == answer:
                    term.term == answer,
                answeredString: answer,
            }
        }
    }
    let answer = $state("");
</script>
<div>
    <p class="fg0">Type the { answerWith == "DEF" ? "definition" : "term"}</p>
    <p class="h4" style="white-space: pre-wrap; margin-bottom: 0px;">{ answerWith == "DEF" ?
        term.term : term.def
    }</p>
    <div class="flex">
        <input type="text" placeholder="{answerWith == "DEF" ?
            "Definition" : "Term"
        }" bind:value={answer} style="min-width: 16rem; field-sizing: content;" class="{showAccuracy ? (
            getQuestion().frq.correct ?
                "yay" : "ohno"
        ) : ""}">
        {#if showAccuracy && getQuestion().frq.correct}
            <CheckmarkIcon class="yay"></CheckmarkIcon>
        {:else if showAccuracy}
            <XMarkIcon class="ohno"></XMarkIcon>
        {/if}
    </div>
</div>
