<script>
    import { onMount } from "svelte";
    import idbApiLayer from "$lib/idb-api-layer/idb-api-layer.js";
    import BackIcon from "$lib/icons/BackArrow.svelte";
    import ForwardLongArrowIcon from "$lib/icons/ForwardRightArrowLong.svelte"
    import ExitIcon from "$lib/icons/Exit.svelte";
    import CheckmarkIcon from "$lib/icons/Checkmark.svelte";
    import MCQ from "$lib/questionComponents/MCQ.svelte"
    import FRQ from "$lib/questionComponents/FRQ.svelte"
    import TrueFalseQuestion from "$lib/questionComponents/TrueFalseQuestion.svelte"
    import { slide, fade } from "svelte/transition";
    import { goto, beforeNavigate } from "$app/navigation";
    import { cancelNprogressTimeout } from "$lib/stores/nprogressTimeout.js";
    import { Confetti } from "svelte-confetti";
    let { data } = $props();
    let terms = $state();
    let practiceTests = $state([]);

    if (!data.local) {
        console.log(data.studyset)
        terms = data?.studyset?.terms;
        practiceTests = data?.studyset?.practiceTests.slice(0, 4);
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
                    },
                    practiceTests: true
                })
                terms = studyset.terms;
                practiceTests = studyset?.practiceTests.slice(0, 4);
            })();
        }
    })

    let answerWith = $state("DEF"); // "TERM", "DEF", or "BOTH"
    let questionTypesEnabled = $state({
        mcq: true,
        trueFalse: false,
        // match: true,
        match: false,
        frq: false
    });

    let questionsCountEntered = $state();

    let defaultQuestionsCount = $derived.by(() => {
        if (terms?.length > 20) {
            return 25;
        } else if (terms?.length > 15) {
            return 20;
        } else if (terms?.length > 10) {
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
    let questionComponents = $state([]);
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

        let remainingCounts = {
            mcq: numMCQsToAssign,
            trueFalse: numTrueFalseQsToAssign,
            match: numMatchQsToAssign,
            frq: numFRQsToAssign
        };

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
            
            pickQuestionType(termsArray[random], remainingCounts)

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
                pickQuestionType(terms[random], remainingCounts);
            } else {
                pickQuestionType(terms[random], remainingCounts);
            }

            pickRepeatedRandomTerm();
        }

        function pickQuestionType(term, remainingCounts) {
            const availableTypes = Object.entries(remainingCounts)
                .filter(([type, count]) => count > 0)
                .map(([type]) => type);
        
            if (availableTypes.length === 0) return;
        
            let questionType;
            if (availableTypes.length === 1) {
                questionType = availableTypes[0];
            } else {
                questionType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
            }
        
            switch (questionType) {
                case "mcq": addMCQ(term); break;
                case "trueFalse": addTrueFalseQuestion(term); break;
                case "match": addMatchQuestion(term); break;
                case "frq": addFRQ(term); break;
            }
        
            remainingCounts[questionType]--;
        }

        // returns a number; higher = more priority
        function confusionPairPriority(count, lastConfusedAtDate, lastReviewedAt) {
            const decayDays = 7;
            const msPerDay = 1000 * 60 * 60 * 24;
            const daysSince = (lastReviewedAt.getTime() - lastConfusedAtDate.getTime()) / msPerDay;
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
                                new Date(confusionPair.lastConfusedAt),
                                new Date(term?.progress?.[
                                    pickedAnswerWith.toLowerCase()+"LastReviewedAt"
                                ] ?? Date.now())
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
                                new Date(confusionPair.lastConfusedAt),
                                new Date(term?.progress?.[
                                    pickedAnswerWith.toLowerCase()+"LastReviewedAt"
                                ] ?? Date.now())
                            )
                        });
                    }
                })
            }
            if (confusionPairDistractors.length > 0) {
                /* remove duplicates by making a map and then putting it back into the same array */
                confusionPairDistractors = [
                    ...(new Map(
                        confusionPairDistractors.map(
                            obj => [obj.id, obj]
                        )
                    )).values()
                ];
                confusionPairDistractors.sort(
                    (a, b) => b.priority - a.priority
                )
                if (confusionPairDistractors.length >= 1 && Math.random() < 0.8) {
                    question.distractors.push({
                        id: confusionPairDistractors[0].id,
                        term: confusionPairDistractors[0].term,
                        def: confusionPairDistractors[0].def
                    });
                }
                if (confusionPairDistractors.length >= 2 && Math.random() < 0.4) {
                    question.distractors.push({
                        id: confusionPairDistractors[1].id,
                        term: confusionPairDistractors[1].term,
                        def: confusionPairDistractors[1].def
                    });
                }
            }

            function avgDistractorAnswerLength() {
                if (question?.distractors == null || question?.distractors?.length == 0) {
                    return 0;
                }

                let sum = 0;
                question.distractors.forEach(d => {
                    sum += d?.[pickedAnswerWith.toLowerCase()]?.length ?? 0;
                })
                return sum / question?.distractors?.length;
            }

            let ogDistractorsCount = 3;
            let distractorsCount = 3;
            let iterations = 0;
            while (question.distractors.length < distractorsCount && iterations <= 99) {
                iterations++;

                const randomTerm = terms[Math.floor(
                    Math.random() * terms.length
                )];

                if (
                    randomTerm.id == term.id || /* if random term is correct answer */
                    question.distractors.some( /* or if it's already an answer choice */
                        d => randomTerm.id == d.id 
                    )
                ) {
                    /* loop again without adding this random term
                    if this term already exists */
                    continue;
                }

                question.distractors.push({
                    id: randomTerm?.id,
                    term: randomTerm?.term,
                    def: randomTerm?.def
                });

                if (
                    question.distractors.length == ogDistractorsCount &&
                    avgDistractorAnswerLength() < 40 &&
                    Math.random() < 0.5
                ) {
                    distractorsCount++;
                }
            }
            if (iterations > 99) {
                console.log("(addMCQ) Took more than 99 iterations to pick random term that wasn't a duplicate")
            }

            questions.push(question)
        }

        function addTrueFalseQuestion(term) {
            let question = {
                type: "TRUE_FALSE",
                term: {
                    id: term.id,
                    term: term.term,
                    def: term.def
                },
                answerWith: answerWith == "BOTH" ?
                    (Math.random() < 0.5 ? "TERM" : "DEF") :
                    answerWith
            }

            let confusionPairTerms = [];
            if (term.topConfusionPairs != null) {
                term.topConfusionPairs.forEach(p => {
                    if (p?.confusedCount >= 2) {
                        confusionPairTerms.push({
                            id: p.confusedTerm.id,
                            term: p.confusedTerm.term,
                            def: p.confusedTerm.def,
                        })
                    }
                })
            }
            if (term.topReverseConfusionPairs != null) {
                term.topReverseConfusionPairs.forEach(p => {
                    if (p?.confusedCount >= 2) {
                        confusionPairTerms.push({
                            id: p.term.id,
                            term: p.term.term,
                            def: p.term.def
                        })
                    }
                })
            }

            question.distractor = null;
            if (confusionPairTerms?.length > 0 && Math.random() < 0.75) {
                question.distractor = confusionPairTerms[
                    Math.floor(Math.random() * confusionPairTerms.length)
                ];
            } else {
                let iterations = 0;
                while (question.distractor == null && iterations <= 99) {
                    iterations++;
                    const randomTerm = terms[Math.floor(Math.random() * terms.length)];
                    if (randomTerm.id != term.id) {
                        question.distractor = {
                            id: randomTerm.id,
                            term: randomTerm.term,
                            def: randomTerm.def
                        }
                    }
                }
                if (iterations > 99) {
                    console.log("(addTrueFalseQuestion) Over 99 iterations to pick random distractor term")
                }
            }
            questions.push(question);
        }

        function addFRQ(term) {
            questions.push({
                type: "FRQ",
                term: term,
                answerWith: answerWith == "BOTH" ?
                    (Math.random() < 0.5 ? "TERM" : "DEF") :
                    answerWith
            })
        }

        pickNewRandomTerm(terms);
        showSetup = false;
        showTest = true;
        takingActualPracticeTest = true;
        
        console.log([...questions])
    }

    var showExitConfirmationModal = $state(false);
    var showTest = $state(false);
    var takingActualPracticeTest = $state(false);
    var bypassExitConfirmation = false;
    let navigatingToURL = $state("");
    beforeNavigate(function (navigation) {
        if (takingActualPracticeTest && questionsAnswered > 0 && !bypassExitConfirmation) {
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

    let questionsViewOnly = $state(false);
    let questionsShowAccuracy = $state(false);
    let questionsAnswered = $state(0);
    function answerUpdateCallback() {
        questionsAnswered = 0;
        questionComponents.forEach(q => {
            if (q.isAnswered()) {
                questionsAnswered++;
            }
        })
    }

    let showScore = $state(false);
    let questionsCorrect = $state(0);

    let recordedPracticeTestId;
    let submitted = $state(false);
</script>
<div class="grid page">
    <div class="content">
        <div class="flex">
            <a class="button faint" href={data.local ?
                `/studyset/local?id=${data.localId}` :
                `/studysets/${data.studysetId}`
            }><BackIcon></BackIcon> Back</a>
        </div>
        {#if takingActualPracticeTest}
            <div style="position: sticky; top: 0px; padding: 1rem; margin-top: 0px; background: var(--bg-1);" transition:slide={{ duration:400 }}>
                <p class="center">{questionsAnswered}/{questions.length} Answered</p>
                <div class="progress-bar yay thin" style="margin-top: 0.4rem;">
                    <div style="width: {Math.floor((questionsAnswered / questions.length) * 100)}%"></div>
                </div>
            </div>
        {/if}
        {#if showScore}
            <div style="position: sticky; top: 0px; padding: 1rem; margin-top: 0px; background: var(--bg-1);" transition:slide={{ duration: 400 }}>
                <div class="flex" style="justify-content: space-between;">
                    <span class="b {
                        questionsCorrect / questions.length >= 0.9 ?
                            "yay" : "ohno"
                    }">{questionsCorrect / questions.length * 100}%</span>
                    <span>{questionsCorrect}/{questions.length} Correct</span>
                </div>
            </div>
            {#if questionsCorrect / questions.length == 1}
                <!-- fullscreen confetti if 100% -->
                <div style="position: fixed; top: -50px; left 0px; margin-top: 0px; height: 100vh; width: 100vw; display: flex; justify-content: center; overflow: hidden; pointer-events: none;">
                    <Confetti x={[-5, 5]} y={[0, 0.1]} delay={[0, 6000]} duration={4000} amount=1000 fallDistance="200vh"/>
                </div>
            {/if}
        {/if}
        {#if showSetup}
            <div id="setup" transition:slide={{duration:400}}>
                <p class="h4">Practice Test</p>
                <p>There {terms?.length == 1 ? "is" : "are"} {terms?.length ?? "?"} {terms?.length == 1 ? "term" : "terms"} in this studyset</p>
                <p style="margin-top: 1rem;">Questions:</p>
                <div style="margin-top: 0.4rem;">
                <input type="text" placeholder={defaultQuestionsCount} style="max-width: 4rem;" bind:value={questionsCountEntered}>
                </div>
                <p style="margin-top: 1rem;">Answer with:</p>
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
                <p style="margin-top: 1rem;">Question types:</p>
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
                    <!-- <button class="button-box { questionTypesEnabled.match ? -->
                    <!--     "selected" : "" -->
                    <!-- }" style="display: flex; margin-top: 0.4rem;" onclick={() => questionTypesEnabled.match = !questionTypesEnabled.match}> -->
                    <!--     <CheckmarkIcon class="button-box-selected-icon"></CheckmarkIcon> -->
                    <!--     Matching -->
                    <!-- </button> -->
                    <button class="button-box { questionTypesEnabled.frq ?
                        "selected" : ""
                    }" style="display: flex; margin-top: 0.4rem;" onclick={() => questionTypesEnabled.frq = !questionTypesEnabled.frq}>
                        <CheckmarkIcon class="button-box-selected-icon"></CheckmarkIcon>
                        Free Response
                    </button>
                </div>
                <div class="flex" style="margin-top: 1rem;">
                    <button onclick={setupStart}><CheckmarkIcon></CheckmarkIcon> Start</button>
                </div>
                {#if practiceTests?.length > 0}
                    <p class="h4" style="margin-top: 2rem;">Completed Practice Tests</p>
                    {#each practiceTests as practiceTest}
                        <div class="box">
                            <div class="flex" style="justify-content: space-between;">
                                <span class="b {
                                    Math.floor((practiceTest.questionsCorrect / practiceTest.questionsTotal) * 100) >= 90 ?
                                        "yay" : "ohno"
                                }">{Math.floor((practiceTest.questionsCorrect / practiceTest.questionsTotal) * 100)}%</span>
                                <span>{practiceTest.questionsCorrect}/{practiceTest.questionsTotal} Questions</span>
                                <a href="{
                                    data.local ?
                                        `/practice-test/local?id=${practiceTest.id}` :
                                        `/practice-tests/${practiceTest.id}`
                                }" style="display: flex; align-items: center; gap: 0.4rem;">
                                    <span>View Details</span>
                                    <ForwardLongArrowIcon class="no-margin-top"></ForwardLongArrowIcon>
                                </a>
                            </div>
                        </div>
                    {/each}
                {/if}
            </div>
        {/if}
        {#if showTest}
            {#each questions as question, index}
                {#if question.type == "MCQ"}
                <div class="box">
                    <MCQ term={question.term} answerWith={question.answerWith} distractors={question.distractors} viewOnly={questionsViewOnly} showAccuracy={questionsShowAccuracy} answerUpdateCallback={answerUpdateCallback} bind:this={questionComponents[index]}></MCQ>
                </div>
                {:else if question.type == "TRUE_FALSE"}
                <div class="box">
                    <TrueFalseQuestion term={question.term} answerWith={question.answerWith} distractor={question.distractor} viewOnly={questionsViewOnly} showAccuracy={questionsShowAccuracy} answerUpdateCallback={answerUpdateCallback} bind:this={questionComponents[index]}></TrueFalseQuestion>
                </div>
                {:else if question.type == "FRQ"}
                <div class="box">
                    <FRQ term={question.term} answerWith={question.answerWith} viewOnly={questionsViewOnly} showAccuracy={questionsShowAccuracy} index={index} answerUpdateCallback={answerUpdateCallback} bind:this={questionComponents[index]}></FRQ>
                </div>
                {/if}
            {/each}
            {#if submitted}
                <div class="flex" transition:slide={{ duration: 400 }}>
                    <p class="yay"><CheckmarkIcon></CheckmarkIcon> Submitted</p>
                </div>
            {:else}
            <div class="flex" transition:slide={{ duration: 400 }}>
                <button class="yay" onclick={async () => {
                    questionsViewOnly = true;
                    questionsShowAccuracy = true;
                    takingActualPracticeTest = false;
                    showScore = true;
                    let questionDataArray = [];
                    questionsCorrect = 0;
                    questionComponents.forEach(questionComponent => {
                        const questionData = questionComponent.getQuestion();
                        questionDataArray.push(questionData);
                        if (questionData.questionType == "MCQ" ?
                            questionData.mcq.correct : (
                            questionData.questionType == "FRQ" ?
                                questionData.frq.correct : (
                                questionData.questionType == "TRUE_FALSE" ?
                                    questionData.trueFalseQuestion.correct : (
                                    () => { console.log("(submit button forEach) unknown/unimplemented question type"); return false; }
                                    )
                                )
                            )
                        ) {
                            questionsCorrect++;
                        }
                    })
                    console.log(questionDataArray)
                    if (data.authed && !data.local) {
                        try {
                            let raw = await fetch("/api/graphql", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({
                                    query: `mutation recordPracticeTest($input: PracticeTestInput) {
    recordPracticeTest(input: $input) {
        id
    }
}`,
                                    variables: {
                                        "input": {
                                            studysetId: data.studysetId,
                                            questionsCorrect: questionsCorrect,
                                            questionsTotal: questions.length,
                                            questions: questionDataArray
                                        }
                                    }
                                })
                            });
                            let resp = await raw.json();
                            if (resp?.data?.recordPracticeTest?.id) {
                                recordedPracticeTestId = resp.data.recordPracticeTest.id;
                                submitted = true;
                            } else {
                                console.log("(submit button) no id in response: ", resp);
                                alert("idk theres some kind of problem while saving sorry i guess")
                            }
                        } catch (err) {
                            console.error("(submit button) Error recording cloud practice test: ", err);
                            alert("idk it kinda couldn't save, check ur internet connection mabye?")
                        }
                    } else {
                        await idbApiLayer.recordPracticeTest(JSON.parse(JSON.stringify({
                            timestamp: (new Date()).toISOString(),
                            studysetId: data.localId ?? data.studysetId,
                            questionsCorrect: questionsCorrect,
                            questionsTotal: questions.length,
                            questions: questionDataArray
                        })));
                        submitted = true;
                    }
                }}>
                    <CheckmarkIcon></CheckmarkIcon>
                    Submit
                </button>
            </div>
            {/if}
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
