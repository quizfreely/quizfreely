<script>
    import CheckmarkIcon from "$lib/icons/Checkmark.svelte";
    import XMarkIcon from "$lib/icons/CloseXMark.svelte";
    let { term, answerWith, distractor, viewOnly, showAccuracy, answerUpdateCallback, answeredBool, wasCorrect } = $props();
    /* answeredBool and wasCorrect are only defined when reviewing questions from a completed practice test */
    let correctAnswerBool = answeredBool != null ?
        (wasCorrect ?
            answeredBool : !answeredBool
        ) : Math.random() < 0.5

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
                distractor: {
                    id: distractor.id,
                    term: distractor.term,
                    def: distractor.def
                }
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
.term-image {
    max-width: 300px;
    max-height: 200px;
    margin: 0px;
    padding: 0px;
    border-radius: 0.8rem;
}
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
            {#if (answerWith == "DEF" ? term.termImageUrl : term.defImageUrl) != null}
                <div><img src={answerWith == "DEF" ? term.termImageUrl : term.defImageUrl} class="term-image" alt="{answerWith == "DEF" ? "term" : "definition"} image"></div>
            {/if}
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
            {#if (answerWith == "DEF" ? presentedAnswer.defImageUrl : presentedAnswer.termImageUrl) != null}
                <div><img src={answerWith == "DEF" ? presentedAnswer.defImageUrl : presentedAnswer.termImageUrl} class="term-image" alt="{answerWith == "DEF" ? "definition" : "term"} image"></div>
            {/if}
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
