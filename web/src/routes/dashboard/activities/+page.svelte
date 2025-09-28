<script>
    import Noscript from "$lib/components/Noscript.svelte";
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
adsf
