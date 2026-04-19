<script>
    import { onMount } from "svelte";
    let { ws, gameCode, studyset, answerWith, ...props } = $props();
    let players = $state(props?.players ?? []);
    let term = $state(null);
    let distractors = $state([]);
    onMount(() => {
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
                const index = players.indexOf(json?.player);
                if (index > 0) {
                    players.splice(
                        index, 1
                    );
                }
            } else if (json?.type == "end") {
                endCallback({players});
            }
        };

        ws.onclose = () => {
          console.log("Connection closed");
        };

        ws.onerror = (err) => {
          console.log("Error: " + err.message);
        };
    });
    function randomQuestion() {
        let unusedTerms = [...studyset.terms];
        term = unusedTerms.splice(Math.floor(Math.random() * unusedTerms.length), 1);
        for (let i = 0; i < 3; i++) {
            distractors.push(unusedTerms.splice(Math.floor(Math.random() * unusedTerms.length), 1));
        }
    }
</script>
<div class="grid page" style="margin-top: 2rem;">
    <div class="content">
        <p class="fg0 center">{gameCode}</p>
        <p></p>
    </div>
</div>
