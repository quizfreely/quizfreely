<script>
    import Noscript from "$lib/components/Noscript.svelte";
    import GroupIcon from "$lib/icons/GroupUsers.svelte";
    import EnterIcon from "$lib/icons/Enter.svelte";
    let { data } = $props();
</script>
<style>
    .top-menu-link {
        margin-top: 0px;
        color: var(--fg-1);
        padding: 0.4rem 0.8rem;
        border-radius: 0.8rem;
    }
    .top-menu-link:hover {
        background-color: var(--bg-3);
    }
    .top-menu-link.current {
        color: var(--main);
        background-color: var(--bg-3);
    }
    .top-menu-link.current:hover {
        color: var(--main-alt);
    }
    .top-menu-nav {
        display: flex;
        flex-direction: row;
        gap: 1rem;
        align-items: center;
        margin-bottom: 1rem;
    }
</style>

<svelte:head>
  <title>Quizfreely</title>
</svelte:head>

<Noscript />
<div class="flex">
    <a class="button" href="/host">
        <GroupIcon></GroupIcon>
        Host Game
    </a>
    <a class="button alt" href="/join">
        <EnterIcon></EnterIcon>
        Join Game
    </a>
</div>
