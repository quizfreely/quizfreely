<script>
    import { onMount } from "svelte";
    let { ws, gameCode, studyset, ...props } = $props();
    onMount(() => {

    })
</script>
<div class="grid page" style="margin-top: 2rem;">
    <div class="content">
        <p class="fg0 center">{gameCode}</p>
        <div class="flex" style="width: 100%; flex-direction: row;">
            {#each playersData as playerData}
                <div class="box grid" style="width: 100%; grid-template-rows: auto; grid-template-columns: 3fr 2fr 2fr 2fr;">
                    <span>{playerData.uniqueName}</span>
                    <span>{playerData.correctCount || 0}/{
                        (playerData.incorrectCount +
                        playerData.correctCount) || 0
                    }</span>
                    <span class={
                    ((playerData.correctCount || 0) / ((
                        playerData.incorrectCount +
                        playerData.correctCount
                    ) || 1)) > 0.9 ? "yay" : "ohno"
                    }>{Math.floor((playerData.correctCount || 0) / ((
                        playerData.incorrectCount +
                        playerData.correctCount
                    ) || 1) * 100)}%</span>
                    <span class={
                        (playerData.streak ?? 0) == 0 ? "fg0" : ""
                    }>{playerData.streak ?? 0} streak</span>
                </div>
            {/each}
        </div>
    </div>
</div>
