<script>
    import { onMount } from "svelte";
    import { env } from "$env/dynamic/public";
    let gameCode = "";
    onMount(() => {
        let uniqueName;
        let ws;

        function log(msg) {
          const logEl = document.getElementById("log");
          logEl.textContent += msg + "\n";
        }

        document.getElementById("connectBtn").onclick = () => {
          uniqueName = document.getElementById("uniqueName").value.trim();

          ws = new WebSocket(env.REALTIME_SERVER_WS_URL+"/ws");

          ws.onopen = () => {
            log("Connected to server");
            // Send initial host/join request
            if (gameCode) {
              ws.send(JSON.stringify({ action: "join", code: gameCode, uniqueName }));
            } else {
              ws.send(JSON.stringify({ action: "host", studyset: { apt: "aptaptapt", u: "uhuhuhuh"} }));
            }
          };

          ws.onmessage = (event) => {
            log("Received: " + event.data);
          };

          ws.onclose = () => {
            log("Connection closed");
          };

          ws.onerror = (err) => {
            log("Error: " + err.message);
          };
        };

        document.getElementById("sendBtn").onclick = () => {
          const msg = document.getElementById("msgInput").value;
          if (ws && ws.readyState === WebSocket.OPEN) {
            const data = { type: "chat", uniqueName, text: msg };
            ws.send(JSON.stringify(data));
            log("Sent: " + JSON.stringify(data));
          } else {
            log("WebSocket not connected");
          }
        };
    })
</script>
<svelte:head>
    <title>WebSocket Game Client</title>
</svelte:head>
<div class="grid page">
    <div class="content">
        <label>
            User ID: <input id="uniqueName" value="Alice">
        </label><br>
        <label>
            Game Code (leave empty to host): <input type="text" id="gameCode" placeholder="A10 B20 C30" autocomplete="off" bind:value={
                () => {
                    if (gameCode?.length > 6) {
                        return gameCode.substring(0,3)+" "+gameCode.substring(3,6)+" "+gameCode.substring(6);
                    } else if (gameCode?.length > 3) {
                        return gameCode.substring(0,3)+" "+gameCode.substring(3,6);
                    } else {
                        return gameCode;
                    }
                },
                (v) => gameCode = v.toUpperCase().replaceAll(" ", "")
            }>
        </label><br>
        <button id="connectBtn">Connect</button>

        <div id="status"></div>

        <h3>Send Message</h3>
        <input id="msgInput" placeholder="Type a message">
        <button id="sendBtn">Send</button>

        <h3>Log</h3>
        <div class="box" style="white-space: pre-wrap" id="log"></div>
    </div>
</div>
