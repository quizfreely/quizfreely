<script>
    let { data } = $props();
    import { onMount } from "svelte";

    import IconPencil from "$lib/icons/Pencil.svelte";
    import IconCheckmark from "$lib/icons/Checkmark.svelte";
    import IconTrash from "$lib/icons/Trash.svelte";

    onMount(function () {
        
    })
</script>
<style>
    .label-thingy {
        display: block;
        margin-bottom: 0px;
    }
    .under-label-thingy {
        margin-top: 0.4rem;
    }
</style>
<div class="box">
    <h4>Review Mode</h4>
    <p for="min-good-acc">"Good" accuracy<br><span class="fg0">Default: &gt; 90%</span></p>
    <input type="text" id="min-good-acc" class="under-label-thingy" placeholder="90">
    <p for="min-good-acc">"Bad" accuracy<br><span class="fg0">Default: &lt; 80%</span></p>
    <input type="text" id="max-bad-acc" class="under-label-thingy" placeholder="80">
    <p class="fg0">You can have different  settings for each studyset under each studyset's settings</p>
</div>
