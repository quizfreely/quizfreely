<script>
    let { ws, gameCode, ...props } = $props();
    let players = $state(props?.players ?? []);
</script>
<div class="grid page">
    <div class="content">
        <div class="flex" style="flex-direction: row;">
            {#each players as player}
                {player}
            {/each}
        </div>
    </div>
</div>
