<script>
    import CheckmarkIcon from "$lib/icons/Checkmark.svelte";
    import XMarkIcon from "$lib/icons/CloseXMark.svelte";
    let { term, answerWith, distractor, viewOnly, showAccuracy, answerUpdateCallback } = $props();
    let correctAnswerBool = Math.random() < 0.5;
    let answeredBool = $state(null);

    export function getQuestion() {
        if (answeredBool == null) {
            console.log("Unanswered True/False Question")
        }
        return {
            questionType: "TRUE_FALSE",
            trueFalseQuestion: {
                term: {
                    id: term.id,
                    term: term.term,
                    def: term.def
                },
                answerWith: answerWith,
                correct: answeredBool == correctAnswerBool,
                answeredBool: answeredBool,
                distractor: distractor
            }
        }
    }
    export function isAnswered() {
        return answeredBool != null;
    }
    let presentedAnswer = correctAnswerBool ?
        term : distractor;
</script>
<style>
.gridsplitthing {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto;
    gap: 1rem;
}
@media only screen and (max-width: 800px) {
    .gridsplitthing {
        grid-template-columns: auto;
        grid-template-rows: auto auto;
    }
}
</style>
<div>
    <p class="fg0">True or False: That { answerWith == "DEF" ? "definition" : "term"} matches, right?</p>
    <div class="grid gridsplitthing">
        <div>
            <p class="fg0">{answerWith == "DEF" ?
                "Term" : "Definition"
            }</p>
            <p class="{
                term[answerWith == "DEF" ?
                    "term" : "def"
                ]?.length < 20 ?
                    "h4" : ""
            }" style="white-space: pre-wrap; margin-top: 0.2rem;">{answerWith == "DEF" ?
                term.term : term.def
            }</p>
        </div>
        <div>
            <p class="fg0">{answerWith == "DEF" ?
                "Definition" : "Term"
            }</p>
            <p class="{
                presentedAnswer[answerWith == "DEF" ?
                    "def" : "term"
                ]?.length < 20 ?
                    "h4" : ""
            }" style="white-space: pre-wrap; margin-top: 0.2rem;">{answerWith == "DEF" ?
                presentedAnswer.def : presentedAnswer.term
            }</p>
        </div>
    </div>
    <div class="flex">
        <button style="display: flex; justify-items: start; justify-content: start; text-align: start;" disabled={viewOnly} class="button-box with-bordercolor-border {
            answeredBool === true ? "selected" : ""
        } {showAccuracy && answeredBool === true ?
            (answeredBool == correctAnswerBool ?
                "yay" : "ohno"
            ) : ""
        }" onclick={() => {
            answeredBool = true;
            answerUpdateCallback();
        }}>
            {#if showAccuracy && answeredBool != correctAnswerBool}
                <XMarkIcon class="button-box-selected-icon"></XMarkIcon>
            {:else}
                <CheckmarkIcon class="button-box-selected-icon"></CheckmarkIcon>
            {/if}
            True
        </button>
        <button style="display: flex; justify-items: start; justify-content: start; text-align: start;" disabled={viewOnly} class="button-box with-bordercolor-border {
            answeredBool === false ? "selected" : ""
        } {showAccuracy && answeredBool === false ?
            (answeredBool == correctAnswerBool ?
                "yay" : "ohno"
            ) : ""
        }" onclick={() => {
            answeredBool = false;
            answerUpdateCallback();
        }}>
            {#if showAccuracy && answeredBool != correctAnswerBool}
                <XMarkIcon class="button-box-selected-icon"></XMarkIcon>
            {:else}
                <CheckmarkIcon class="button-box-selected-icon"></CheckmarkIcon>
            {/if}
            False
        </button>
    </div>
</div>
