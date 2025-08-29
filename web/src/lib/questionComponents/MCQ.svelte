<script>
    import CheckmarkIcon from "$lib/icons/Checkmark.svelte";
    import XMarkIcon from "$lib/icons/CloseXMark.svelte";
    let { term, answerWith, distractors, viewOnly, showAccuracy, answerUpdateCallback } = $props();
    function shuffleArray(ogArray) {
        let arr = [...ogArray];
        for (let index = arr.length - 1; index > 0; index--) {
            const randomIndex = Math.floor(Math.random() * (index + 1));
            [arr[index], arr[randomIndex]] = [arr[randomIndex], arr[index]];
        }
        return arr;
    }
    let answers = $state(shuffleArray([...distractors, term]));
    let answeredIndex = $state(-1);
    let correctAnswerIndex = answers.findIndex(
        answer => term.id == answer.id
    )

    export function getQuestion() {
        if (answeredIndex == -1) {
            console.log("Unanswered MCQ")
        }
        return {
            questionType: "MCQ",
            mcq: {
                term: term,
                answerWith: answerWith,
                correct: answeredIndex == correctAnswerIndex,
                answeredTerm: answeredIndex >= 0 ?
                    answers[answeredIndex] : null,
                distractors: distractors
            }
        }
    }
    export function isAnswered() {
        return answeredIndex >= 0;
    }
</script>
<div>
    <p class="fg0">Select the matching { answerWith == "DEF" ? "definition" : "term"}</p>
    <p class="h4" style="white-space: pre-wrap;">{ answerWith == "DEF" ?
        term.term : term.def
    }</p>
    <div style="display: grid; gap: 0.2rem; grid-template-columns: auto; justify-content: start; margin-top: 0.6rem;">
        {#each answers as answer, index}
            <button style="display: flex; justify-items: start; justify-content: start; text-align: start; margin-top: 0px;" class="button-box with-bordercolor-border { answeredIndex == index ? "selected" : ""} {
                showAccuracy && index == answeredIndex ?
                    (answeredIndex == correctAnswerIndex ?
                        "yay" : "ohno"
                    ) : ""
            }" onclick={() => {
                answeredIndex = index;
                answerUpdateCallback()
            }} disabled={viewOnly}>
                {#if showAccuracy && index != correctAnswerIndex}
                    <XMarkIcon class="button-box-selected-icon"></XMarkIcon>
                {:else}
                    <CheckmarkIcon class="button-box-selected-icon"></CheckmarkIcon>
                {/if}
                <span style="white-space: pre-wrap; margin-top: 0px;">{
                    answerWith == "DEF" ?
                        answer.def : answer.term
                }</span>
            </button>
        {/each}
    </div>
</div>
