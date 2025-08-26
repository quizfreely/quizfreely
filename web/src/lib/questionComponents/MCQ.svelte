<script>
    import CheckmarkIcon from "$lib/icons/Checkmark.svelte";
    let { term, answerWith, distractors } = $props();
    let answers = [...distractors, term];
    function shuffleArray(ogArray) {
        let arr = [...ogArray];
        for (let index = arr.length - 1; index > 0; index--) {
            const randomIndex = Math.floor(Math.random() * (index + 1));
            [arr[index], arr[randomIndex]] = [arr[randomIndex], arr[index]];
        }
        return arr;
    }
    answers = shuffleArray(answers);
    let answeredIndex = $state(-1);
    let correctAnswerIndex = answers.findIndex(
        answer => term.id == answer.id
    )

    export function getQuestion() {
        if (answeredIndex == -1) {
            console.log("Unanswered MCQ")
            return null;
        }
        return {
            questionType: "MCQ",
            mcq: {
                term: term,
                answerWith: answerWith,
                correct: answeredIndex == correctAnswerIndex,
                answeredTerm: answers[answeredIndex],
                distractors: distractors
            }
        }
    }
</script>
<div>
    <p class="fg0">Select the matching { answerWith == "DEF" ? "definition" : "term"}</p>
    <p class="h4">{ answerWith == "DEF" ?
        term.term : term.def
    }</p>
    <div style="display: grid; gap: 0.2rem; grid-template-columns: auto; justify-content: start; margin-top: 0.6rem;">
        {#each answers as answer, index}
            <button style="display: flex; justify-items: start; justify-content: start; text-align: start; margin-top: 0px;" class="button-box with-bordercolor-border { answeredIndex == index ? "selected" : ""}" onclick={() => answeredIndex = index}>
                <CheckmarkIcon class="button-box-selected-icon"></CheckmarkIcon> {
                    answerWith == "DEF" ?
                        answer.def : answer.term
                }
            </button>
        {/each}
    </div>
</div>
