<script>
    import CheckmarkIcon from "$lib/icons/Checkmark.svelte";
    import XMarkIcon from "$lib/icons/CloseXMark.svelte";
    let { term, answerWith, viewOnly, showAccuracy, answerUpdateCallback, showCorrectAnswer } = $props();
    let manuallyMarkedCorrect = $state(false);
    export function getQuestion() {
        if (answer == "") {
            console.log("Possibly Unanswered FRQ")
        }
        return {
            questionType: "FRQ",
            frq: {
                term: {
                    id: term.id,
                    term: term.term,
                    def: term.def
                },
                answerWith: answerWith,
                correct: manuallyMarkedCorrect || (answerWith == "DEF" ?
                    term.def.trim().toLowerCase() == answer.trim().toLowerCase() :
                    term.term.trim().toLowerCase() == answer.trim().toLowerCase()
                ),
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
    {#if showCorrectAnswer}
    <p class="fg0">You entered:</p>
    {/if}
    <div class="flex" style="align-content: center; align-items: center; {showCorrectAnswer ? "margin-top: 0.4rem;" : ""}">
        <input type="text" placeholder="{answerWith == "DEF" ?
            "Definition" : "Term"
        }" bind:value={answer} style="min-width: 16rem; field-sizing: content;" class="{showAccuracy ? (
            getQuestion().frq.correct ?
                "yay" : "ohno"
        ) : ""}" disabled={viewOnly} oninput={answerUpdateCallback}>
        {#if showAccuracy && getQuestion().frq.correct}
            <span class="yay"><CheckmarkIcon width="1.6rem" height="1.6rem"></CheckmarkIcon></span>
        {:else if showAccuracy}
            <span class="ohno"><XMarkIcon width="1.6rem" height="1.6rem"></XMarkIcon></span>
        {/if}
    </div>
    {#if showAccuracy && showCorrectAnswer}
        <p class="fg0">Correct { answerWith == "DEF" ? "definition" : "term"}:</p>
        <p class={(answerWith == "DEF" ? term.def : term.term)?.length < 20 ? "h4" : ""} style="white-space: pre-wrap; margin-bottom: 0px; margin-top: 0.2rem;">{ answerWith == "DEF" ?
            term.def : term.term
        }</p>
    {/if}
    {#if showAccuracy && manuallyMarkedCorrect}
        <div class="flex" style="align-items: center;">
            <p class="fg0">Manually marked correct</p>
            <button class="warn alt" onclick={() => {
                manuallyMarkedCorrect = false;
            }}>Undo?</button>
        </div>
    {:else if showAccuracy && showCorrectAnswer && !getQuestion().frq.correct}
        <button class="warn alt" onclick={() => {
            manuallyMarkedCorrect = true;
        }}>Manually mark as correct?</button>
    {/if}
    {#if showAccuracy && showCorrectAnswer}
        <div>
        <button class="faint" onclick={() => {
            showCorrectAnswer = false;
        }}>Hide Correct Answer</button>
        </div>
    {:else if showAccuracy && (manuallyMarkedCorrect || !getQuestion().frq.correct)}
        <div>
        <button class="faint" onclick={() => {
            showCorrectAnswer = true;
        }}>Show Correct Answer</button>
        </div>
    {/if}
</div>
