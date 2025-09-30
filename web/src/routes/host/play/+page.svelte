<script>
    import { env } from "$env/dynamic/public";
    import { onMount } from "svelte";
    import idbApiLayer from "$lib/idb-api-layer/idb-api-layer.js";
    import Lobby from "$lib/multiplayer/Lobby.svelte";
    import Leaderboard from "$lib/multiplayer/Leaderboard.svelte";
    let { data } = $props();
    let ws = $state(null);
    let gameCode = $state(null);
    let studyset = data.studyset;
    let inGame = $state(false);
    let showResults = $state(false);
    onMount(async () => {
        if (data.localId != null) {
            studyset = await idbApiLayer.getStudysetById(
                data.localId, {
                    terms: true
                }
            );
        }
        ws = new WebSocket(env.REALTIME_SERVER_WS_URL+"/ws");
        ws.onopen = () => {
            console.log("Connected to server");
            ws.send(JSON.stringify({
                action: "host",
                studyset
            }));
        };

        ws.onmessage = (event) => {
            console.log("Received: " + event.data);
            const json = JSON.parse(event.data);
            if (json?.error && json?.msg) {
                errorMsg = json.msg;
                showErrorMsg = true;
            }
            if (json?.type == "host_joined") {
                gameCode = json.code.substring(0,4)+" "+json.code.substring(4);
                ;
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
{#if ws && gameCode && !inGame}
    <Lobby {ws} {gameCode} hostPOV startCallback={() => {
        inGame = true;
    }}></Lobby>
{:else if ws && gameCode && inGame}
    <Leaderboard {ws} {gameCode} endCallback={() => {
        inGame = false;
        showResults = true;
    }}></Leaderboard>
{:else if showResults}
    asdf
{/if}
