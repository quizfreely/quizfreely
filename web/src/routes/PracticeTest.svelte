<script>
    import { onMount } from "svelte";
    import idbApiLayer from "$lib/idb-api-layer/idb-api-layer.js";
    import db from "$lib/idb-api-layer/db.js";
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
    import { fancyTimestamp } from "$lib/fancyTimestamp";
    import { Confetti } from "svelte-confetti";
    let { data } = $props();
    let terms = $state();
    let practiceTests = $state([]);

    // maps questions from practice test data to objs with props for question components
    function mapPracticeTestQuestionToQuestionComponentFormat(q) {
        return {
            type: q.questionType,
            term: q?.mcq?.term ?? q?.trueFalseQuestion?.term,
            answerWith: q?.mcq?.answerWith ?? q?.trueFalseQuestion?.answerWith,
            answeredTerm: q.mcq?.answeredTerm,
            answeredBool: q.trueFalseQuestion?.answeredBool,
            distractors: q.mcq?.distractors,
            distractor: q.trueFalseQuestion?.distractor,
            correctChoiceIndex: q.mcq?.correctChoiceIndex,
            wasCorrect: q?.mcq?.correct ?? q?.trueFalseQuestion?.correct
        }
    }

    if (!data.local && !data.alreadyOver) {
        console.log(data.studyset)
        terms = data?.studyset?.terms;
        practiceTests = data?.studyset?.practiceTests;
    }
    let alreadyOverLocalPTStudysetId = $state(-1);
    let mounted = $state(false);
    onMount(async () => {
        mounted = true;
        if (data?.settingsDateTimeFmtHours == "24") {
            fancyTimestamp.hours = 24;
        } else if (data?.settingsDateTimeFmtHours == "12") {
            fancyTimestamp.hours = 12;
        }

        if (data.local && data.alreadyOver) {
            const pt = (await db.practiceTests.where("id").equals(data.practiceTestId).toArray())?.[0];
            if (pt == null) {
                alert("invalid local practice test id");
                console.error("local practice test not found");
            } else {
                questions = pt.questions.map(
                    mapPracticeTestQuestionToQuestionComponentFormat
                );
                questionsCorrect = pt.questionsCorrect;
                alreadyOverLocalPTStudysetId = pt.studysetId;
            }
        }

        if (data.local && !data.alreadyOver) {
            /* studyset is local, so regardless of wheater the user is logged in or not,
            we load the studyset and progress locally */
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
            practiceTests = studyset?.practiceTests;
        }

        if (!data.authed && !data.local && !data.alreadyOver) {
            /* not logged in, so user data is local,
            but studyset is a cloud studyset,
            so we need to map local progress to cloud terms

            `terms` has already been populated during SSR (above, before onMount) */
            practiceTests = await db.practiceTests.where("studysetId").equals(data.studysetId).toArray();
            practiceTests?.sort(
                /* timestamps are ISO strings in UTC,
                so lexical/alphanumeric sorting is the same as chronological sorting
                also you see we're comparing `b` to `a`, so its descending,
                so most recent is first */
                (a, b) => b.timestamp.localeCompare(a.timestamp)
            );
            practiceTests = practiceTests;

            for (const term of terms) {
                term.progress = await db.termProgress.where("termId").equals(term.id).toArray()?.[0];
                term.topConfusionPairs = await idbApiLayer.getTopConfusionPairs(term.id)
                term.topReverseConfusionPairs = await idbApiLayer.getTopReverseConfusionPairs(term.id)
            }
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

    let showSetup = $state(!data?.alreadyOver);
    let questions = $state(data?.practiceTest?.questions?.map(
        mapPracticeTestQuestionToQuestionComponentFormat
    ) ?? []);
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
                    /* use fallback same term as distractor */
                    question.distractor = {
                        id: term.id,
                        term: term.term,
                        def: term.def
                    }
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
    var showTest = $state(data.alreadyOver);
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

    let questionsViewOnly = $state(data?.alreadyOver);
    let questionsShowAccuracy = $state(data?.alreadyOver);
    let questionsAnswered = $state(0);
    function answerUpdateCallback() {
        questionsAnswered = 0;
        questionComponents.forEach(q => {
            if (q.isAnswered()) {
                questionsAnswered++;
            }
        })
    }

    let showScore = $state(data?.alreadyOver);
    let questionsCorrect = $state(data?.practiceTest?.questionsCorrect ?? 0);

    let recordedPracticeTestId;
    if (data?.practiceTestId != null) {
        recordedPracticeTestId = data.practiceTestId;
    }
    let submitted = $state(data?.alreadyOver);
</script>
<style>
    .gridfourpartthingrow {
        display: grid;
        gap: 1rem;
        grid-template-columns: 1fr 1fr 2fr auto;
        grid-template-rows: 1fr;
        grid-template-areas: "one two three four";
    }
    .fourpartthing-one {
        grid-area: one;
    }
    .fourpartthing-two {
        grid-area: two;
    }
    .fourpartthing-three {
        grid-area: three;
        justify-self: start;
    }
    .fourpartthing-four {
        grid-area: four;
        justify-self: end;
    }
    @media only screen and (max-width: 800px) {
        .gridfourpartthingrow {
            grid-template-columns: 1fr 1fr 2fr;
            grid-template-rows: auto auto;
            grid-template-areas:
                "one two three"
                "four four four"
        }
        .fourpartthing-three {
            justify-self: end;
        }
        .fourpartthing-four {
            justify-self: start;
        }
    }
</style>
<div class="grid page">
    <div class="content">
        <div class="flex">
            <a class="button faint" href={data.alreadyOver ? 
                (data.local ? /* when alreadyOver is true, data.local means practice test is local,
                but the studyset might be a cloud studyset */
                    (("" + alreadyOverLocalPTStudysetId).includes("-") ?
                    /* uuids have dashes/hyphens */
                        `/studysets/${alreadyOverLocalPTStudysetId}` :
                        `/studyset/local?id=${alreadyOverLocalPTStudysetId}`
                    ) :
                    `/studysets/${data.studysetId}`
                    /* if the practice test is a cloud pt, then the studyset is always a cloud studyset,
                    but a local practice test can be for a local OR cloud studyset */
                ) :
                (data.local ?
                    `/studyset/local?id=${data.localId}` :
                    `/studysets/${data.studysetId}`
                )
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
                    <!-- <button class="button-box { questionTypesEnabled.frq ? -->
                    <!--     "selected" : "" -->
                    <!-- }" style="display: flex; margin-top: 0.4rem;" onclick={() => questionTypesEnabled.frq = !questionTypesEnabled.frq}> -->
                    <!--     <CheckmarkIcon class="button-box-selected-icon"></CheckmarkIcon> -->
                    <!--     Free Response -->
                    <!-- </button> -->
                </div>
                <div class="flex" style="margin-top: 1rem;">
                    <button onclick={setupStart}><CheckmarkIcon></CheckmarkIcon> Start</button>
                </div>
                    <div class="flex compact-gap" style="margin-top: 2rem; align-items: end; justify-content: space-between; flex-wrap: wrap;">
                        <p class="h4" style="margin-bottom: 0px;">Completed Practice Tests</p>
                        <p class="fg0">{practiceTests?.length ?? 0} total</p>
                    </div>
                    {#each practiceTests as practiceTest}
                        <div class="box">
                            <div class="grid gridfourpartthingrow">
                                <span class="b fourpartthing-one {
                                    Math.floor((practiceTest.questionsCorrect / practiceTest.questionsTotal) * 100) >= 90 ?
                                        "yay" : "ohno"
                                }">{Math.floor((practiceTest.questionsCorrect / practiceTest.questionsTotal) * 100)}%</span>
                                <span class="fourpartthing-two">{practiceTest.questionsCorrect}/{practiceTest.questionsTotal}</span>
                                <span class="fourpartthing-three">{mounted ? fancyTimestamp.format(practiceTest.timestamp) : "..."}</span>
                                <a href="{
                                    data.authed && !data.local ?
                                        `/practice-tests/${practiceTest.id}` :
                                        `/practice-test/local?id=${practiceTest.id}`
                                }" class="fourpartthing-four" style="display: flex; align-items: center; gap: 0.4rem;">
                                    <span>View Details</span>
                                    <ForwardLongArrowIcon class="no-margin-top"></ForwardLongArrowIcon>
                                </a>
                            </div>
                        </div>
                    {:else}
                        <div class="box center text fg0">
                            (None)
                        </div>
                    {/each}
            </div>
        {/if}
        {#if showTest}
            {#each questions as question, index}
                {#if question.type == "MCQ"}
                <div class="box">
                    <MCQ term={question.term} answerWith={question.answerWith} distractors={question.distractors} viewOnly={questionsViewOnly} showAccuracy={questionsShowAccuracy} answerUpdateCallback={answerUpdateCallback} bind:this={questionComponents[index]} answeredTerm={question.answeredTerm} correctChoiceIndex={question.correctChoiceIndex}></MCQ>
                </div>
                {:else if question.type == "TRUE_FALSE"}
                <div class="box">
                    <TrueFalseQuestion term={question.term} answerWith={question.answerWith} distractor={question.distractor} viewOnly={questionsViewOnly} showAccuracy={questionsShowAccuracy} answerUpdateCallback={answerUpdateCallback} bind:this={questionComponents[index]} answeredBool={question.answeredBool} wasCorrect={question.wasCorrect}></TrueFalseQuestion>
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
                    let termProgressToUpdate = new Map();
                    questionComponents.forEach(questionComponent => {
                        const questionData = questionComponent.getQuestion();
                        questionDataArray.push(questionData);

                        const thisTermId = questionData.mcq?.term?.id ??
                            questionData.trueFalseQuestion?.term?.id;
                        if (thisTermId == null) {
                            console.error("term id from question is null(ish)! this might happen if new question types aren't fully implemented");
                        }
                        const thisAnswerWith = questionData.mcq?.answerWith ??
                            questionData.trueFalseQuestion?.answerWith;
                        let termCorrectIncrease = 0;
                        let termIncorrectIncrease = 0;
                        let defCorrectIncrease = 0;
                        let defIncorrectIncrease = 0;
                        if (
                            questionData?.mcq?.correct ||
                            questionData?.trueFalseQuestion?.correct
                        ) {
                            questionsCorrect++;

                            if (thisAnswerWith == "DEF") {
                                defCorrectIncrease = 1;
                            } else {
                                termCorrectIncrease = 1;
                            }
                        } else {
                            if (thisAnswerWith == "DEF") {
                                defIncorrectIncrease = 1;
                            } else {
                                termIncorrectIncrease = 1;
                            }
                        }

                        if (thisTermId != null) {
                            let existingToUpdate = termProgressToUpdate.get(
                                thisTermId
                            );
                            if (existingToUpdate == null) {
                                termProgressToUpdate.set(thisTermId, {
                                    termId: thisTermId,
                                    ...(thisAnswerWith == "DEF" ?
                                        {defReviewedAt: (new Date()).toISOString()} :
                                        {termReviewedAt: (new Date()).toISOString()}
                                    ),
                                    termCorrectIncrease,
                                    termIncorrectIncrease,
                                    defCorrectIncrease,
                                    defIncorrectIncrease,
                                    ...(termIncorrectIncrease > 0 ?
                                        {termLeitnerSystemBox: 1} : {}
                                    ),
                                    ...(defIncorrectIncrease > 0 ?
                                        {defLeitnerSystemBox: 1} : {}
                                    )
                                });
                            } else {
                                termProgressToUpdate.set(thisTermId, {
                                    ...existingToUpdate,
                                    ...(thisAnswerWith == "DEF" ?
                                        {defReviewedAt: (new Date()).toISOString()} :
                                        {termReviewedAt: (new Date()).toISOString()}
                                    ),
                                    termCorrectIncrease: (
                                        existingToUpdate.termCorrectIncrease ?? 0 +
                                        termCorrectIncrease
                                    ),
                                    termIncorrectIncrease: (
                                        existingToUpdate.termIncorrectIncrease ?? 0 +
                                        termIncorrectIncrease
                                    ),
                                    defCorrectIncrease: (
                                        existingToUpdate.defCorrectIncrease ?? 0 +
                                            defCorrectIncrease
                                    ),
                                    defIncorrectIncrease: (
                                            existingToUpdate.defIncorrectIncrease ?? 0 +
                                            defIncorrectIncrease
                                    ),
                                    ...(termIncorrectIncrease > 0 ?
                                        {termLeitnerSystemBox: 1} : {}
                                    ),
                                    ...(defIncorrectIncrease > 0 ?
                                        {defLeitnerSystemBox: 1} : {}
                                    )
                                })
                            }
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
                                    query: `mutation recordPracticeTest(
    $input: PracticeTestInput,
    $termProgress: [TermProgressInput!]!
) {
    recordPracticeTest(input: $input) {
        id
    }
    updateTermProgress(termProgress: $termProgress) {
        id
    }
}`,
                                    variables: {
                                        "input": {
                                            studysetId: data.studysetId,
                                            questionsCorrect: questionsCorrect,
                                            questionsTotal: questions.length,
                                            questions: questionDataArray
                                        },
                                        /* .values() returns a map iterator, which JSON.stringify does NOT automatically turn into an array,
                                        so we use the spread operator to make it into an array that JSON.stringify() can use */
                                        "termProgress": [...termProgressToUpdate.values()]
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
                        /* .values() returns a map iterator (not an array),
                        but that's fine because idbApiLayer.updateTermProgress() accepts any iteratable type */
                        await idbApiLayer.updateTermProgress(...termProgressToUpdate.values());
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
{#if !data?.alreadyOver && showScore && questionsCorrect / questions.length == 1}
    <!-- fullscreen confetti if 100% -->
    <div style="position: fixed; top: -50px; left 0px; margin: 0px; padding: 0px; height: 100vh; width: 100vw; display: flex; justify-content: center; overflow: hidden; pointer-events: none;">
        <Confetti x={[-5, 5]} y={[0, 0.1]} delay={[0, 6000]} duration={4000} amount=1000 fallDistance="200vh"/>
    </div>
{/if}
