<script>
    let gameCode = $state("");
    let uniqueName;
    let codeEntered = $state(false);
</script>
<style>
    .large-textbox-thing,
    .large-textbox-thing::placeholder {
        font-size: 1.4rem;
    }
</style>
<svelte:head>
    <title>Quizfreely</title>
</svelte:head>
<div style="display: grid; align-items: center; justify-items: center; height: 70vh;">
    <div class="box">
        <h1 class="h3 center" style="margin-bottom: 0px;">Join Game</h1>
        {#if !codeEntered}
        <div>
        <input class="large-textbox-thing" style="max-width: 16rem;" type="text" id="gameCode" placeholder="A100 B200" autocomplete="off" bind:value={gameCode} oninput={(e) => {
            let pos = e.target.selectionStart ?? 0;
            gameCode = gameCode.toUpperCase().replaceAll(" ", "");
            if (gameCode.length > 4) {
                gameCode = gameCode.substring(0, 4) + " " + gameCode.substring(4);
                if (pos >= 5) {
                    pos++;
                    e.target.setSelectionRange(pos, pos);
                }
            }
        }}>
        </div>
        {:else}
        <div>
        <input class="large-textbox-thing" style="max-width: 16rem;" type="text" id="gameCode" placeholder="Name" autocomplete="off" bind:value={uniqueName}>
        </div>
        {/if}
        <button class="large yay" style="width: 100%;" onclick={() => {
            if (!codeEntered) {
                codeEntered = true;
                return;
            }
        }}>Join</button>
    </div>
</div>
