<script>
    import { onMount } from "svelte";
    import { scale } from "svelte/transition";
    import UserIcon from "$lib/icons/User.svelte";
    import XMarkIcon from "$lib/icons/CloseXMark.svelte";
    import CheckmarkIcon from "$lib/icons/Checkmark.svelte";
    let { ws, gameCode, hostPOV, ...props } = $props();
    let players = $state(props?.players ?? []);
    let showKicking = $state(false);
    let kickingUniqueName = $state("");

    onMount(() => {
        if (hostPOV) {
            document.documentElement.style.fontSize = "20px";
        }

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
    })
</script>
<div class="grid page" style="margin-top: 4rem;">
    <div class="content">
        {#if hostPOV}
            <p class="fg0 center h4">quizfreely.org/join</p>
        {/if}
        <p class="center {
            hostPOV ? "h1" : "h4"
        }">{gameCode}</p>
        <div class="flex" style="justify-content: space-between; align-items: end;">
            <div style="display: flex; align-items: center; gap: 0.4rem;">
                <UserIcon class="text fg0"></UserIcon>
                <span class="fg0 no-margin-top">{players.length} Joined</span>
            </div>
            {#if hostPOV}
                <div class="flex" style="justify-content: end;">
                    <button>
                        <CheckmarkIcon></CheckmarkIcon> Start
                    </button>
                </div>
            {/if}
        </div>
        <div class="grid list">
            {#each players as player}
                <div class="box flex" transition:scale={{ duration: 200 }} style="align-items: center; justify-content: space-between;">
                    <span>{player}</span>
                    {#if hostPOV}
                    <button class="icon-only-button" onclick={() => {
                        kickingUniqueName = player;
                        showKicking = true;
                    }}>
                        <XMarkIcon></XMarkIcon>
                    </button>
                    {/if}
                </div>
            {/each}
        </div>
    </div>
</div>
{#if showKicking}
<div class="modal">
    <div class="content">
        <p>Remove "{kickingUniqueName}"?</p>
        <div class="flex">
            <button class="ohno" onclick={() => {
                ws.send(JSON.stringify({
                    action: "kick",
                    uniqueName: kickingUniqueName
                }));
                kickingUniqueName = "";
                showKicking = false;
            }}>
                Remove
            </button>
            <button class="alt" onclick={() => {
                kickingUniqueName = "";
                showKicking = false;
            }}>
                Cancel
            </button>
        </div>
    </div>
</div>
{/if}
