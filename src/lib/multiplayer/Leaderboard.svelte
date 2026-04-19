<script>
    import { onMount } from "svelte";
    import { flip } from "svelte/animate";
    import { scale } from "svelte/transition";
    let { ws, gameCode, ...props } = $props();
    let playersData = $state(props?.players?.map(
        player => ({
            uniqueName: player,
            correctCount: 0,
            incorrectCount: 0,
            streak: 0
        })
    ) ?? []);
    onMount(() => {
        ws.onmessage = (event) => {
            console.log("Received: " + event.data);
            const json = JSON.parse(event.data);
            if (json?.error && json?.msg) {
                errorMsg = json.msg;
                showErrorMsg = true;
            }
            if (json?.type == "player_joined") {
                playersData.push({
                    uniqueName: json?.player,
                    correctCount: 0,
                    incorrectCount: 0,
                    streak: 0
                });
            } else if (json?.type == "player_left") {
                const index = playersData.find(
                    player => player.uniqueName == json.player
                );
                if (index > 0) {
                    playersData.splice(
                        index,
                        1
                    );
                }
            } else if (json?.type == "end") {
                endCallback({playersData});
            }
        };

        ws.onclose = () => {
          console.log("Connection closed");
        };

        ws.onerror = (err) => {
          console.log("Error: " + err.message);
        };
    })
</script>
<div class="grid page" style="margin-top: 2rem;">
    <div class="content">
        <p class="fg0 center">{gameCode}</p>
        <div class="flex" style="width: 100%; flex-direction: row;">
            {#each playersData as playerData, index (playerData.uniqueName)}
                <div class="box grid" style="width: 100%; grid-template-rows: auto; grid-template-columns: 3fr 2fr 2fr 2fr;" animate:flip={{ duration: 400 }} in:scale={{ duration: 400 }} out:scale={{ duration: 400 }}>
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
