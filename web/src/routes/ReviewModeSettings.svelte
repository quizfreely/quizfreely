<!--
See web/src/routes/settings/studying-algorithm/+page.svelte
(same UI, different functionality)

This is used by web/src/routes/studyset/local/review-mode/settings/+page.svelte
and web/src/routes/studysets/[id]/review-mode/settings/+page.svelte
-->

<script>
    let { data } = $props();
    import { onMount } from "svelte";

    import IconPencil from "$lib/icons/Pencil.svelte";
    import IconCheckmark from "$lib/icons/Checkmark.svelte";
    import IconTrash from "$lib/icons/Trash.svelte";
    import IconBackArrow from "$lib/icons/BackArrow.svelte";
    import { page } from "$app/state";
    import Noscript from "$lib/components/Noscript.svelte";
    var showInvalidReviewModeAcc = $state(false);
    var reviewModeChangesSaved = $state(false);
    
    onMount(function () {
        if (window.localStorage) {
            var goodAcc = parseFloat(localStorage.getItem("quizfreely:settings.reviewMode.goodAcc"));
            var badAcc = parseFloat(localStorage.getItem("quizfreely:settings.reviewMode.badAcc"));
            if (goodAcc >= 1 && goodAcc <= 100) {
                document.getElementById("good-acc").value = goodAcc;
            }
            if (badAcc >= 0 && badAcc <= 100) {
                document.getElementById("bad-acc").value = badAcc;
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

    /* from web/src/routes/settings/+layout.svelte */
    .settings-container {
        display: grid;
        gap: 1rem;
        grid-template-columns: 1fr 4fr;
        grid-template-rows: 1fr;
    }
    .settings-menu-link {
        margin-top: 0px;
        color: var(--fg1);
        padding: 0.4rem 0.8rem;
        border-radius: 0.8rem;
    }
    .settings-menu-link:hover {
        background-color: var(--bg3);
    }
    .settings-menu-link.current {
        color: var(--main);
        background-color: var(--bg3);
    }
    .settings-menu-link.current:hover {
        color: var(--main-alt);
    }
    .settings-menu-nav {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
    }

    @media only screen and (max-width: 800px) {
        .settings-container {
            grid-template-columns: 1fr;
            grid-template-rows: auto 1fr;
        }
        .settings-menu-nav {
            flex-direction: row;
            gap: 1rem;
            margin-bottom: 1rem;
        }
    }
</style>
<Noscript />
<div class="grid page">
<div class="content">
<div>
    {#if (data.local) }
    <a href="/studyset/local/review-mode?id={ data.localId }" class="button faint">
      <IconBackArrow /> Back
    </a>
    {:else}
    <a href="/studysets/{ data.studysetId }/review-mode" class="button faint">
      <IconBackArrow /> Back
    </a>
    {/if}
</div>
<div class="settings-container">
    <div>
        <div class="settings-menu-nav">
        <a href="#top" class="settings-menu-link current">
            For this studyset
        </a>
        <a href="/settings/studying-algorithm" class="settings-menu-link">
            For all studysets
        </a>
        </div>
    </div>
    <div class="box" style="margin-top:0px">
        <h4>Review Mode Settings</h4>
        <p class="label-thingy">
            "Good" accuracy<br>
            <span class="fg0">Default: &gt; 90%</span>
        </p>
        <div class="input-thingy-container">
            <input type="text" id="good-acc" class="input-thingy" placeholder="90" oninput={() => reviewModeChangesSaved = false}>
            <span class="input-thingy-percent">%</span>
        </div>
        <p class="label-thingy">
            "Bad" accuracy<br>
            <span class="fg0">Default: &lt; 80%</span>
        </p>
        <div class="input-thingy-container">
            <input type="text" id="bad-acc" class="input-thingy" placeholder="80" oninput={() => reviewModeChangesSaved = false}>
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
                var newGoodAcc = parseFloat(document.getElementById("good-acc").value)
                var newBadAcc = parseFloat(document.getElementById("bad-acc").value)
                if (
                    newGoodAcc >= 1 && newGoodAcc <= 100 &&
                    newBadAcc >= 1 && newBadAcc <= 100 &&
                    newGoodAcc > newBadAcc
                ) {
                    showInvalidReviewModeAcc = false
                    localStorage.setItem(
                        "quizfreely:settings.reviewMode.goodAcc",
                        newGoodAcc
                    )
                    localStorage.setItem(
                        "quizfreely:settings.reviewMode.badAcc",
                        newBadAcc
                    )
                    reviewModeChangesSaved = true
                    document.getElementById("good-acc").value = newGoodAcc;
                    document.getElementById("bad-acc").value = newBadAcc;
                } else {
                    showInvalidReviewModeAcc = true
                }
            }
        }}><IconCheckmark /> Save</button>
        </div>
    </div>
</div>
</div>
</div>
