<script>
    let { data } = $props();
    import { onMount } from "svelte";

    import IconPencil from "$lib/icons/Pencil.svelte";
    import IconCheckmark from "$lib/icons/Checkmark.svelte";
    import IconTrash from "$lib/icons/Trash.svelte";
    
    onMount(function () {
        if (window.localStorage) {
            var goodAcc = parseInt(localStorage.getItem("quizfreely:settings.reviewMode.goodAcc"));
            var badAcc = parseInt(localStorage.getItem("quizfreely:settings.reviewMode.badAcc"));
            if (goodAcc > 0 && goodAcc <= 100) {
                document.getElementById("good-acc").value = goodAcc;
            }
            if (badAcc > 0 && badAcc < 100) {
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
</style>
<div class="box">
    <h4>Review Mode</h4>
    <p class="label-thingy">
        "Good" accuracy<br>
        <span class="fg0">Default: &gt; 90%</span>
    </p>
    <div class="input-thingy-container">
        <input type="text" id="good-acc" class="input-thingy" placeholder="90"><span class="input-thingy-percent">%</span>
    </div>
    <p class="label-thingy">
        "Bad" accuracy<br>
        <span class="fg0">Default: &lt; 80%</span>
    </p>
    <div class="input-thingy-container">
        <input type="text" id="bad-acc" class="input-thingy" placeholder="80"><span class="input-thingy-percent">%</span>
    </div>
    <div class="flex">
    <button onclick={function () {
        if (window.localStorage) {
            localStorage.setItem(
                "quizfreely:settings.reviewMode.goodAcc",
                document.getElementById("good-acc").value
            )
            localStorage.setItem(
                "quizfreely:settings.reviewMode.badAcc",
                document.getElementById("bad-acc").value
            )
        }
    }}><IconCheckmark /> Save</button>
    </div>
    <p class="fg0">You can choose different settings for each studyset under those studysets' settings.</p>
</div>
