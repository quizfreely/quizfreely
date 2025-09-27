<script>
    import { env } from "$env/dynamic/public";
    import { scale } from "svelte/transition";
    let gameCode = $state("");
    let uniqueName;
    let codeEntered = $state(false);
    let showErrorMsg = $state(false)
    let errorMsg = $state("");
    let ws;
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
        }}>
        </div>
        {:else}
        <div>
        <input class="large-textbox-thing" style="max-width: 16rem;" type="text" id="gameCode" placeholder="Name" autocomplete="off" bind:value={uniqueName} transition:scale={{duration: 400}}>
        </div>
        {/if}
        <button class="large yay" style="width: 100%;" onclick={async () => {
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
        }}>Join</button>
        {#if showErrorMsg}
        <p class="ohno center" style="max-width: 16rem; white-space: pre-wrap;" transition:scale={{ duration: 200 }}>
            {errorMsg}
        </p>
        {/if}
    </div>
</div>
