<script>
    import CheckmarkIcon from "$lib/icons/Checkmark.svelte";
    let { term, answerWith } = $props();
    export function getQuestion() {
        if (answer == "") {
            console.log("Possibly Unanswered FRQ")
        }
        return {
            questionType: "FRQ",
            fcq: {
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
    <p class="fg0">Type the matching { answerWith == "DEF" ? "definition" : "term"}</p>
    <p class="h4" style="margin-bottom: 0px;">{ answerWith == "DEF" ?
        term.term : term.def
    }</p>
    <input type="text" placeholder="{answerWith == "DEF" ?
        "Definition" : "Term"
    }" bind:value={answer}>
</div>
