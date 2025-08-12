<script>
    let { data } = $props();
    import { onMount } from "svelte";

    import IconPencil from "$lib/icons/Pencil.svelte";
    import IconCheckmark from "$lib/icons/Checkmark.svelte";
    import IconTrash from "$lib/icons/Trash.svelte";
    import Local from "$lib/icons/Local.svelte";
    var showInvalidAcc = $state(false);
    var showInvalidLearningMinSessionsCount = $state(false);
    var changesSaved = $state(false);
    
    onMount(function () {
        if (window.localStorage) {
            var goodAcc = parseFloat(localStorage.getItem("quizfreely:settings.studyingAlgorithm.goodAcc"));
            var badAcc = parseFloat(localStorage.getItem("quizfreely:settings.studyingAlgorithm.badAcc"));
            var learningMinSessionsCount = parseInt(localStorage.getItem("quizfreely:settings.studyingAlgorithm.learningMinSessionsCount"));
            if (goodAcc >= 1 && goodAcc <= 100) {
                document.getElementById("studying-algorithm-good-acc").value = goodAcc;
            }
            if (badAcc >= 0 && badAcc <= 100) {
                document.getElementById("studying-algorithm-bad-acc").value = badAcc;
            }
            if (learningMinSessionsCount >= 1) {
              document.getElementById("studying-algorithm-learning-min-sessions-count").value = learningMinSessionsCount;
            }
        }
    })
</script>
<style>
    .label-thingy {
        margin-bottom: 0px;
    }
    .input-thingy-container {
        display: flex;
        margin-top: 0.4rem;
        flex-direction: row;
        gap: 0.4rem;
        align-items: center;
        align-content: center;
    }
    .input-thingy {
        margin-top: 0px;
        max-width: 5rem;
    }
    .input-thingy-percent {
        margin-top: 0px;
    }
</style>
<div class="box">
    <div class="flex" style="gap: 2rem;">
    <div>
    <p class="label-thingy">
        "Good" accuracy<br>
        <span class="fg0">Default: &gt; 90%</span>
    </p>
    <div class="input-thingy-container">
        <input type="text" id="studying-algorithm-good-acc" class="input-thingy" placeholder="90" oninput={() => changesSaved = false}>
        <span class="input-thingy-percent">%</span>
    </div>
    </div>
    <div>
    <p class="label-thingy">
        "Bad" accuracy<br>
        <span class="fg0">Default: &lt; 80%</span>
    </p>
    <div class="input-thingy-container">
        <input type="text" id="studying-algorithm-bad-acc" class="input-thingy" placeholder="80" oninput={() => changesSaved = false}>
        <span class="input-thingy-percent">%</span>
    </div>
    </div>
    </div>
    <p class="label-thingy">
            Minimum review count for new(ish) terms<br>
            <span class="fg0">Default: 5</span>
        </p>
        <div class="input-thingy-container">
            <input type="text" id="studying-algorithm-learning-min-sessions-count" class="input-thingy" placeholder="5" oninput={() => changesSaved = false}>
        </div>
    <div class="box ohno { showInvalidAcc ? "" : "hide" }">
        "Good" accuracy needs to be greater than "bad" accuracy.<br>
        Both need to be between 1 and 100
    </div>
            <div class="box ohno { showInvalidLearningMinSessionsCount ? "" : "hide" }">
            Min review count needs to be a number greater than or equal to 1
        </div>

    {#if changesSaved}
        <p class="fg0">Changes Saved</p>
    {/if}
    <div class="flex">
    <button onclick={function () {
        if (window.localStorage) {
            var newGoodAcc = parseFloat(document.getElementById("studying-algorithm-good-acc").value)
            var newBadAcc = parseFloat(document.getElementById("studying-algorithm-bad-acc").value)
            var newLearningMinSessionsCount = parseInt(document.getElementById("studying-algorithm-learning-min-sessions-count").value)

            showInvalidAcc = false;

            if (newBadAcc >= 1 && newBadAcc <= 100 && (
                newGoodAcc > newBadAcc ||
                document.getElementById("studying-algorithm-good-acc").value == ""
            )) {
                localStorage.setItem(
                    "quizfreely:settings.studyingAlgorithm.badAcc",
                    newBadAcc
                )
                document.getElementById("studying-algorithm-bad-acc").value = newBadAcc;
            } else if (document.getElementById("studying-algorithm-bad-acc").value == "") {
                localStorage.removeItem(
                    "quizfreely:settings.studyingAlgorithm.badAcc"
                )
            } else {
                showInvalidAcc = true;
            }

            if (newGoodAcc >= 1 && newGoodAcc <= 100 && (
                newGoodAcc > newBadAcc ||
                document.getElementById("studying-algorithm-bad-acc").value == ""
            )) {
                localStorage.setItem(
                    "quizfreely:settings.studyingAlgorithm.goodAcc",
                    newGoodAcc
                )
                document.getElementById("studying-algorithm-good-acc").value = newGoodAcc;
            } else if (document.getElementById("studying-algorithm-good-acc").value == "") {
                localStorage.removeItem(
                    "quizfreely:settings.studyingAlgorithm.goodAcc"
                )
            } else {
                showInvalidAcc = true;
            }

            if (newLearningMinSessionsCount >= 1) {
                localStorage.setItem("quizfreely:settings.studyingAlgorithm.learningMinSessionsCount",
                    newLearningMinSessionsCount
                )
            } else if (document.getElementById("studying-algorithm-learning-min-sessions-count").value == "") {
                localStorage.removeItem("quizfreely:settings.studyingAlgorithm.learningMinSessionsCount")
            } else {
                showInvalidLearningMinSessionsCount = true;
            }

            if ((!showInvalidAcc) && (!showInvalidLearningMinSessionsCount)) {
                changesSaved = true;
            }
        }
    }}><IconCheckmark /> Save</button>
    </div>
    <!-- <p class="fg0">You can choose different settings for each studyset inside Review Mode or a Practice Test for that studyset.</p> -->
</div>
