<script lang="ts">
    import { env } from "$env/dynamic/public";
    import { onMount } from "svelte";
    import { idbApiLayer } from "$lib/idb-api-layer";
    import Lobby from "$lib/multiplayer/Lobby.svelte";
    import Leaderboard from "$lib/multiplayer/Leaderboard.svelte";
    let { data }: { data: any } = $props();
    let ws = $state<WebSocket | null>(null);
    let gameCode = $state<string | null>(null);
    let studyset = $state(data.studyset);
    let inGame = $state(false);
    let showResults = $state(false);
    let players = $state<any[]>([]);
    let showErrorMsg = $state(false);
    let errorMsg = $state("");

    onMount(async () => {
        if (data.localId != null) {
            studyset = await idbApiLayer.getStudysetById(
                data.localId, {
                    terms: true
                }
            );
        }
        const socket = new WebSocket(env.REALTIME_SERVER_WS_URL+"/ws");
        ws = socket;
        socket.onopen = () => {
            console.log("Connected to server");
            socket.send(JSON.stringify({
                action: "host",
                studyset
            }));
        };

        socket.onmessage = (event) => {
            console.log("Received: " + event.data);
            const json = JSON.parse(event.data);
            if (json?.error && json?.msg) {
                errorMsg = json.msg;
                showErrorMsg = true;
            }
            if (json?.type == "host_joined") {
                gameCode = json.code.substring(0,4)+" "+json.code.substring(4);
            }
        };

        socket.onclose = () => {
          console.log("Connection closed");
        };

        socket.onerror = (err: any) => {
          console.log("Error: " + err.message);
        };
    })
</script>
{#if ws && gameCode && !inGame}
    <Lobby {ws} {gameCode} hostPOV={true} startCallback={(d: any) => {
        players = d.players;
        inGame = true;
    }}></Lobby>
{:else if ws && gameCode && inGame}
    <Leaderboard {ws} {players} {gameCode} endCallback={() => {
        inGame = false;
        showResults = true;
    }}></Leaderboard>
{:else if showResults}
    asdf
{/if}
