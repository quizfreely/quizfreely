<script>
    let { data } = $props();
    import { onMount } from "svelte";

    import IconPencil from "$lib/icons/Pencil.svelte";
    import IconCheckmark from "$lib/icons/Checkmark.svelte";
    import IconTrash from "$lib/icons/Trash.svelte";
    var showInvalidReviewModeAcc = $state(false);
    var reviewModeChangesSaved = $state(false);
    
    onMount(function () {
        if (window.localStorage) {
            var goodAcc = parseFloat(localStorage.getItem("quizfreely:settings.reviewMode.goodAcc"));
            var badAcc = parseFloat(localStorage.getItem("quizfreely:settings.reviewMode.badAcc"));
            if (goodAcc >= 1 && goodAcc <= 100) {
                document.getElementById("review-mode-good-acc").value = goodAcc;
            }
            if (badAcc >= 0 && badAcc <= 100) {
                document.getElementById("review-mode-bad-acc").value = badAcc;
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
    <h4>Review Mode</h4>
    <p class="label-thingy">
        "Good" accuracy<br>
        <span class="fg0">Default: &gt; 90%</span>
    </p>
    <div class="input-thingy-container">
        <input type="text" id="review-mode-good-acc" class="input-thingy" placeholder="90" oninput={() => reviewModeChangesSaved = false}>
        <span class="input-thingy-percent">%</span>
    </div>
    <p class="label-thingy">
        "Bad" accuracy<br>
        <span class="fg0">Default: &lt; 80%</span>
    </p>
    <div class="input-thingy-container">
        <input type="text" id="review-mode-bad-acc" class="input-thingy" placeholder="80" oninput={() => reviewModeChangesSaved = false}>
        <span class="input-thingy-percent">%</span>
    </div>
    <div class="box ohno { showInvalidReviewModeAcc ? "" : "hide" }">
        "Good" accuracy needs to be greater than "bad" accuracy.<br>
        Both need to be between 1 and 100
    </div>
    {#if reviewModeChangesSaved}
        <p class="fg0">Changes Saved</p>
    {/if}
    <div class="flex">
    <button onclick={function () {
        if (window.localStorage) {
            var newGoodAcc = parseFloat(document.getElementById("review-mode-good-acc").value)
            var newBadAcc = parseFloat(document.getElementById("review-mode-bad-acc").value)

            showInvalidReviewModeAcc = false;

            if (newBadAcc >= 1 && newBadAcc <= 100 && (
                newGoodAcc > newBadAcc ||
                document.getElementById("review-mode-good-acc").value == ""
            )) {
                localStorage.setItem(
                    "quizfreely:settings.reviewMode.badAcc",
                    newBadAcc
                )
                document.getElementById("review-mode-bad-acc").value = newBadAcc;
            } else if (document.getElementById("review-mode-bad-acc").value == "") {
                localStorage.removeItem(
                    "quizfreely:settings.reviewMode.badAcc"
                )
            } else {
                showInvalidReviewModeAcc = true;
            }

            if (newGoodAcc >= 1 && newGoodAcc <= 100 && (
                newGoodAcc > newBadAcc ||
                document.getElementById("review-mode-bad-acc").value == ""
            )) {
                localStorage.setItem(
                    "quizfreely:settings.reviewMode.goodAcc",
                    newGoodAcc
                )
                document.getElementById("review-mode-good-acc").value = newGoodAcc;
            } else if (document.getElementById("review-mode-good-acc").value == "") {
                localStorage.removeItem(
                    "quizfreely:settings.reviewMode.goodAcc"
                )
            } else {
                showInvalidReviewModeAcc = true;
            }

            if (!showInvalidReviewModeAcc) {
                reviewModeChangesSaved = true;
            }
        }
    }}><IconCheckmark /> Save</button>
    </div>
    <p class="fg0">You can choose different settings for each studyset inside Review Mode for that studyset.</p>
</div>
