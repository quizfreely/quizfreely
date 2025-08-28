<script>
    import { onMount } from "svelte";
    import idbApiLayer from "$lib/idb-api-layer/idb-api-layer.js";
    import BackIcon from "$lib/icons/BackArrow.svelte";
    import ExitIcon from "$lib/icons/Exit.svelte";
    import CheckmarkIcon from "$lib/icons/Checkmark.svelte";
    import MCQ from "$lib/questionComponents/MCQ.svelte"
    import FRQ from "$lib/questionComponents/FRQ.svelte"
    import TrueFalseQuestion from "$lib/questionComponents/TrueFalseQuestion.svelte"
    import { slide, fade } from "svelte/transition";
    import { goto, beforeNavigate } from "$app/navigation";
    import { cancelNprogressTimeout } from "$lib/stores/nprogressTimeout.js";
    let { data } = $props();
    let terms = $state();

    if (!data.local) {
        terms = data?.studyset?.terms;
    }
    onMount(() => {
        if (data.local) {
            (async () => {
                const studyset = await idbApiLayer.getStudysetById(data.localId, {
                    terms: {
                        progress: true,
                        topConfusionPairs: {
                            confusedTerm: true
                        },
                        topReverseConfusionPairs: {
                            term: true
                        }
                    }
                })
                terms = studyset.terms;
            })();
        }
    })

    let answerWith = $state("DEF"); // "TERM", "DEF", or "BOTH"
    let questionTypesEnabled = $state({
        mcq: true,
        trueFalse: false,
        match: true,
        frq: false
    });

    let questionsCountEntered = $state();

    let defaultQuestionsCount = $derived.by(() => {
        if (terms?.length > 20) {
            return 25;
        } else if (terms?.length > 15) {
            return 20;
        } else if (terms.length > 10) {
            return 15;
        } else {
            return 10;
        }
    });

    function shuffleArray(ogArray) {
        let arr = [...ogArray];
        for (let index = arr.length - 1; index > 0; index--) {
            const randomIndex = Math.floor(Math.random() * (index + 1));
            [arr[index], arr[randomIndex]] = [arr[randomIndex], arr[index]];
        }
        return arr;
    }

    let showSetup = $state(true);
    let questions = $state([]);
    function setupStart() {
        if (terms == null || terms.length < 1) {
            alert("oops, not enough terms");
            console.log("Terms array: ", terms);
            return;
        }

        let questionsCount = defaultQuestionsCount;
        if (!isNaN(parseInt(questionsCountEntered))) {
            questionsCount = questionsCountEntered;
        }

        let questionTypesEnabledArray = [];
        Object.entries(questionTypesEnabled).forEach(
            ([questionType, enabled]) => {
                if (enabled) {
                    questionTypesEnabledArray.push(questionType);
                }
            }
        )

        let numMCQsToAssign = 0;
        let numTrueFalseQsToAssign = 0;
        let numMatchQsToAssign = 0;
        let numFRQsToAssign = 0;
        let unassignedQuestionsCount = questionsCount;

        let unassignedQuestionTypesCount = questionTypesEnabledArray.length;

        if (questionTypesEnabled.match) {
            if (unassignedQuestionsCount >= 20) {
                numMatchQsToAssign = 10;
            } else if (unassignedQuestionsCount >= 10) {
                numMatchQsToAssign = 5;
            } else if (unassignedQuestionsCount >= 8) {
                numMatchQsToAssign = 4;
            }
            unassignedQuestionsCount -= numMatchQsToAssign;

            unassignedQuestionTypesCount--;
        }
        if (questionTypesEnabled.frq) {
            numFRQsToAssign = Math.floor(
                unassignedQuestionsCount /
                unassignedQuestionTypesCount
            );
            unassignedQuestionsCount -= numFRQsToAssign;

            unassignedQuestionTypesCount--;
        }
        if (questionTypesEnabled.trueFalse) {
            numTrueFalseQsToAssign = Math.floor(
                unassignedQuestionsCount /
                unassignedQuestionTypesCount
            );
            unassignedQuestionsCount -= numTrueFalseQsToAssign;

            unassignedQuestionTypesCount--;
        }
        if (questionTypesEnabled.mcq) {
            numMCQsToAssign = unassignedQuestionsCount;
            unassignedQuestionsCount = 0;
            unassignedQuestionTypesCount--;
        }
        console.log(
            `Total: ${questionsCount},
MCQs: ${numMCQsToAssign},
True/False: ${numTrueFalseQsToAssign},
Matching: ${numMatchQsToAssign},
FRQs: ${numFRQsToAssign}`
        );

        function pickNewRandomTerm(ogTermsArray) {
            let termsArray = [...ogTermsArray];
            if (termsArray.length == 0) {
                pickRepeatedRandomTerm();
                return;
            }
            if (questions.length >= questionsCount) {
                return;
            }
            const random = Math.floor(Math.random() * termsArray.length);
            
            pickQuestionType(termsArray[random], questionTypesEnabledArray)

            termsArray.splice(random, 1);
            pickNewRandomTerm(termsArray)
        }

        function pickRepeatedRandomTerm() {
            if (questions.length >= questionsCount) {
                return;
            }

            const random = Math.floor(Math.random() * terms.length);
            let questionsWSameTerm = questions.filter(
                q => q.termId == terms[random].id
            );
            let unusedQuestionTypes = [...questionTypesEnabledArray];
            questionsWSameTerm.forEach(q => {
                const index = unusedQuestionTypes.indexOf(q.questionType);
                if (index > -1) {
                    unusedQuestionTypes.splice(index, 1);
                }
            });
            if (unusedQuestionTypes.length > 0) {
                pickQuestionType(terms[random], questionTypesEnabledArray);
            } else {
                pickQuestionType(terms[random], unusedQuestionTypes);
            }

            pickRepeatedRandomTerm();
        }

        function pickQuestionType(term, questionTypes) {
            if (questionTypes == null || questionTypes?.length == 0) {
                console.error("pickQuestionType(term, questionTypes) needs a questionTypes array that's not null & not empty")
                return;
            }

            let questionType;
            if (questionTypes.length = 1) {
                questionType = questionTypes[0];
            } else {
                questionType = questionTypes[Math.floor(
                    Math.random() * questionTypes.length
                )];
            }
            switch (questionType) {
                case "mcq":
                    addMCQ(term);
                    break;
                case "trueFalse":
                    addTrueFalseQuestion(term);
                    break;
                case "match":
                    addMatchQuestion(term);
                    break;
                case "frq":
                    addFRQ(term);
                    break;
                default:
                    console.error("(pickQuestionType) Unknown question type: ", questionType);
            }
        }

        // returns a number; higher = more priority
        function confusionPairPriority(count, lastConfusedAtDate) {
            const now = Date.now();
            const decayDays = 7;
            const msPerDay = 1000 * 60 * 60 * 24;
            const daysSince = (now - lastConfusedAtDate.getTime()) / msPerDay;
            // log1p to get diminishing returns on count; exp for recency decay
            return Math.log1p(count) * Math.exp(-daysSince / decayDays);
        }

        function addMCQ(term) {
            const pickedAnswerWith = answerWith == "BOTH" ?
                (Math.random() < 0.5 ? "TERM" : "DEF") :
                answerWith
            let question = {
                type: "MCQ",
                term: {
                    id: term.id,
                    term: term.term,
                    def: term.def,
                },
                answerWith: pickedAnswerWith
            }
            question.distractors = [];
            let confusionPairDistractors = [];
            if (term?.topConfusionPairs != null) {
                term.topConfusionPairs.forEach(confusionPair => {
                    if (
                        confusionPair.answeredWith == pickedAnswerWith &&
                        confusionPair.confusedCount >= 2 &&
                        (
                            term.progress != null &&
                            confusionPair.confusedCount > 0.25 * term.progress[
                                pickedAnswerWith.toLowerCase()+"IncorrectCount"
                            ]
                        )
                    ) {
                        confusionPairDistractors.push({
                            ...confusionPair.confusedTerm,
                            priority: confusionPairPriority(
                                confusionPair.confusedCount,
                                new Date(confusionPair.lastConfusedAt)
                            )
                        });
                    }
                })
            }
            if (term?.topReverseConfusionPairs != null) {
                term.topReverseConfusionPairs.forEach(confusionPair => {
                    if (
                        confusionPair.answeredWith != pickedAnswerWith &&
                        confusionPair.confusedCount >= 2 &&
                        (
                            term.progress != null &&
                            confusionPair.confusedCount > 0.25 * term.progress[
                                pickedAnswerWith.toLowerCase()+"IncorrectCount"
                            ]
                        )
                    ) {
                        confusionPairDistractors.push({
                            ...confusionPair.term,
                            priority: confusionPairPriority(
                                confusionPair.confusedCount,
                                new Date(confusionPair.lastConfusedAt)
                            )
                        });
                    }
                })
            }
            if (confusionPairDistractors.length > 0) {
                confusionPairDistractors.sort(
                    (a, b) => b.priority - a.priority
                )
                if (confusionPairDistractors.length >= 1) {
                    question.distractors.push({
                        id: confusionPairDistractors[0].id,
                        term: confusionPairDistractors[0].term,
                        def: confusionPairDistractors[0].def
                    });
                }
                if (confusionPairDistractors.length >= 2) {
                    question.distractors.push({
                        id: confusionPairDistractors[1].id,
                        term: confusionPairDistractors[1].term,
                        def: confusionPairDistractors[1].def
                    });
                }
            }
            while (question.distractors.length < 3) {
                const randomTerm = terms[Math.floor(
                    Math.random() * terms.length
                )];
                question.distractors.push({
                    id: randomTerm?.id,
                    term: randomTerm?.term,
                    def: randomTerm?.def
                });
            }
            questions.push(question)
        }

        pickNewRandomTerm(terms);
        showSetup = false;
        takingActualPracticeTest = true;
        
        console.log([...questions])
    }

    var showExitConfirmationModal = $state(false);
    var takingActualPracticeTest = $state(false);
    var bypassExitConfirmation = false;
    let navigatingToURL = $state("");
    beforeNavigate(function (navigation) {
        if (takingActualPracticeTest && !bypassExitConfirmation) {
            navigatingToURL = navigation?.to?.url;
            if (navigation.type !== "leave") {
                /* when navigation.type is NOT "leave",
                it's controlled by SvelteKit, so we can
                show our js confirmation modal */
                showExitConfirmationModal = true;
            }
            /* our routes/+layout.svelte shows a progress bar
            if navigation takes too long, so we cancel the timer
            when we cancel navigation, so that it doesn't show */
            cancelNprogressTimeout();

            /* run it again a little delayed to make sure it cancels the timeout after layout actually finishes creating the timeout */
            setTimeout(cancelNprogressTimeout, 50);

            /* if navigation.type is "leave",
            then its controlled by the browser &
            the browser shows it's own native modal
            when we use `.cancel()` */
            navigation.cancel();

        }
    })
</script>
<div class="grid page">
    <div class="content">
        <div class="flex">
            <a class="button faint" href={data.local ?
                `/studyset/local?id=${data.localId}` :
                `/studysets/${data.studysetId}`
            }><BackIcon></BackIcon> Back</a>
        </div>
        {#if showSetup}
            <div id="setup" transition:slide={{duration:400}}>
                <p class="h3">Practice Test</p>
                <p>There {terms?.length == 1 ? "is" : "are"} {terms?.length ?? "?"} {terms?.length == 1 ? "term" : "terms"} in this studyset</p>
                <p style="margin-top: 1rem;">Questions:</p>
                <div style="margin-top: 0.4rem;">
                <input type="text" placeholder={defaultQuestionsCount} style="max-width: 4rem;" bind:value={questionsCountEntered}>
                </div>
                <p style="margin-top: 2rem;">Answer with:</p>
                <div class="flex" style="margin-top: 0.6rem;">
                    <button class="button-box {answerWith == "DEF" ? "selected" : ""}" style="display: flex;" onclick={() => answerWith = "DEF"}>
                        <CheckmarkIcon class="button-box-selected-icon"></CheckmarkIcon>
                        Definition
                    </button>
                    <button class="button-box {answerWith == "TERM" ? "selected" : ""}" style="display: flex;" onclick={() => answerWith = "TERM"}>
                        <CheckmarkIcon class="button-box-selected-icon"></CheckmarkIcon>
                        Term
                    </button>
                    <button class="button-box {answerWith == "BOTH" ? "selected" : ""}" style="display: flex;" onclick={() => answerWith = "BOTH"}>
                        <CheckmarkIcon class="button-box-selected-icon"></CheckmarkIcon>
                        Both
                    </button>
                </div>
                <p style="margin-top: 2rem;">Question types:</p>
                <div style="display: grid; grid-template-columns: auto; justify-content: start; margin-top: 0.6rem;">
                    <button class="button-box { questionTypesEnabled.mcq ?
                        "selected" : ""
                    }" style="display: flex;" onclick={() => questionTypesEnabled.mcq = !questionTypesEnabled.mcq }>
                        <CheckmarkIcon class="button-box-selected-icon"></CheckmarkIcon>
                        Multiple Choice
                    </button>
                    <button class="button-box { questionTypesEnabled.trueFalse ?
                        "selected" : ""
                    }" style="display: flex; margin-top: 0.4rem;" onclick={() => questionTypesEnabled.trueFalse = !questionTypesEnabled.trueFalse}>
                        <CheckmarkIcon class="button-box-selected-icon"></CheckmarkIcon>
                        True/False
                    </button>
                    <button class="button-box { questionTypesEnabled.match ?
                        "selected" : ""
                    }" style="display: flex; margin-top: 0.4rem;" onclick={() => questionTypesEnabled.match = !questionTypesEnabled.match}>
                        <CheckmarkIcon class="button-box-selected-icon"></CheckmarkIcon>
                        Matching
                    </button>
                    <button class="button-box { questionTypesEnabled.frq ?
                        "selected" : ""
                    }" style="display: flex; margin-top: 0.4rem;" onclick={() => questionTypesEnabled.frq = !questionTypesEnabled.frq}>
                        <CheckmarkIcon class="button-box-selected-icon"></CheckmarkIcon>
                        Free Response
                    </button>
                </div>
                <div class="flex" style="margin-top: 2rem;">
                    <button onclick={setupStart}><CheckmarkIcon></CheckmarkIcon> Start</button>
                </div>
            </div>
        {/if}
        {#if takingActualPracticeTest}
            {#each questions as question, index}
                {#if question.type == "MCQ"}
                <div class="box">
                    <MCQ term={question.term} answerWith={question.answerWith} distractors={question.distractors}></MCQ>
                </div>
                {/if}
            {/each}
        {/if}
        <!-- <p style="white-space: pre-wrap">{JSON.stringify(terms, null, 4)}</p> -->
        {#if showExitConfirmationModal}
        <div class="modal" transition:fade={{ duration: 200 }}>
          <div class="content">
            <h4>Are you sure you want to exit?</h4>
            <p>You need to finish &amp; submit this practice test to save your answers.</p>
            <div class="flex">
              <button class="alt" onclick={function () { showExitConfirmationModal = false; }}>Continue Practicing</button>
              <button class="button ohno alt" data-sveltekit-preload-data="false" onclick={function () {
                bypassExitConfirmation = true;
                goto(navigatingToURL);
              }}>
                <ExitIcon />
                Exit
              </button>
            </div>
          </div>
        </div>
        {/if}
    </div>
</div>
