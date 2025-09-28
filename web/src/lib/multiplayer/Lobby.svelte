<script>
    import { scale } from "svelte/transition";
    import UserIcon from "$lib/icons/User.svelte";
    import XMarkIcon from "$lib/icons/CloseXMark.svelte";
    import CheckmarkIcon from "$lib/icons/Checkmark.svelte";
    let { ws, gameCode, hostPOV, ...props } = $props();
    let players = $state(props.players);
    ws.onopen = () => {
      console.log("Connected to server");
      ws.send(JSON.stringify({ action: "join", code: gameCode.replaceAll(" ", ""), uniqueName }));
    };

    ws.onmessage = (event) => {
        console.log("Received: " + event.data);
        const json = JSON.parse(event.data);
        if (json?.error && json?.msg) {
            errorMsg = json.msg;
            showErrorMsg = true;
        }
        if (json?.type == "player_joined") {
            players.push(json?.player);
        } else if (json?.type == "player_left") {
            players.splice(
                players.indexOf(json?.player),
                1
            );
        }
    };

    ws.onclose = () => {
      console.log("Connection closed");
    };

    ws.onerror = (err) => {
      console.log("Error: " + err.message);
    };
</script>
<div class="grid page" style="margin-top: 2rem;">
    <div class="content">
        <p class="center h4">{gameCode}</p>
        {#if hostPOV}
            <button class="large">
                <CheckmarkIcon></CheckmarkIcon> Start
            </button>
        {/if}
        <div style="display: flex; align-items: center; gap: 0.4rem;">
            <UserIcon class="text fg0"></UserIcon>
            <span class="fg0 no-margin-top">{players.length} Joined</span>
        </div>
        <div class="grid list">
            {#each players as player}
                <div class="box flex" transition:scale={{ duration: 200 }} style="align-items: center; justify-content: space-between;">
                    <span>{player}</span>
                    {#if hostPOV}
                    <button class="icon-only-button">
                        <XMarkIcon></XMarkIcon>
                    </button>
                    {/if}
                </div>
            {/each}
        </div>
    </div>
</div>
