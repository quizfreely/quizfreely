<script>
    import { env } from "$env/dynamic/public";
    import { scale } from "svelte/transition";
    import Lobby from "$lib/multiplayer/Lobby.svelte";
    let { data } = $props()
    let gameCode = $state("");
    let uniqueName;
    let codeEntered = $state(false);
    let inLobby = $state(false);
    let inGame = $state(false);
    let showErrorMsg = $state(false)
    let errorMsg = $state("");
    let ws;
    let players = [];

    if (data?.prefilledCode?.length > 0) {
        gameCode = data.prefilledCode.substring(0,4)+" "+data.prefilledCode.substring(4);
        codeEntered = true;
    }

    async function joinButton() {
        showErrorMsg = false;
        if (!codeEntered) {
            if (gameCode.replaceAll(" ", "").length == 8) {
                try {
                    const respRaw = await fetch(
                        `/realtime/status/${gameCode.replaceAll(" ", "")}`
                    );
                    const resp = await respRaw.json();
                    if (resp.active) {
                        codeEntered = true;
                        return;
                    } else if (resp?.active === false) {
                        errorMsg = "Game Not Found"
                        showErrorMsg = true;
                        return;
                    }
                } catch (err) {
                    console.error(err);
                    errorMsg = "Server error :(\nI don't know why\nTry again mabye"
                    showErrorMsg = true;
                    return;
                }
            } else {
                errorMsg = "Invalid Code"
                showErrorMsg = true;
                return;
            }
        } else if (uniqueName?.length > 0) {
            ws = new WebSocket(env.REALTIME_SERVER_WS_URL+"/ws");
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
                if (json?.type == "joined" && json?.alreadyStarted) {
                    players = json?.players;
                    alert("ohnogamealreadystarted")
                    inGame = true;
                } else if (json?.type == "joined") {
                    players = json?.players;
                    inLobby = true;
                } else if (json?.type == "player_joined") {
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
        } else {
            errorMsg = "Your name can't be blank"
            showErrorMsg = true;
            return;
        }
    }
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
{#if !inLobby && !inGame}
<div style="display: grid; align-items: center; justify-items: center; height: 70vh;">
    <div class="box" style="padding: 2rem 2rem;">
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
        }} onkeyup={(e) => {
            if (e.key == "Enter") {
                joinButton();
            }
        }}>
        </div>
        {:else}
        <div>
        <input class="large-textbox-thing" style="max-width: 16rem;" type="text" id="gameCode" placeholder="Name" autocomplete="off" bind:value={uniqueName} transition:scale={{duration: 400}} onkeyup={(e) => {
            if (e.key == "Enter") {
                joinButton();
            }
        }}>
        </div>
        {/if}
        <button class="large" style="width: 100%;" onclick={joinButton}>Join</button>
        {#if showErrorMsg}
        <p class="ohno center" style="max-width: 16rem; white-space: pre-wrap;" transition:scale={{ duration: 200 }}>
            {errorMsg}
        </p>
        {/if}
    </div>
</div>
{:else if inLobby}
    <Lobby {ws} {players} {gameCode}></Lobby>
{/if}
