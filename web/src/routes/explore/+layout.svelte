<script>
    import { page } from "$app/state";
    import { fade } from "svelte/transition";
    import { sineIn, sineOut } from "svelte/easing";
    import Noscript from "$lib/components/Noscript.svelte";
    import IconBackArrow from "$lib/icons/BackArrow.svelte";
    let { children, data } = $props();
</script>
<style>
    .top-menu-link {
        margin-top: 0px;
        color: var(--fg-0);
        padding: 0.4rem 0.8rem;
        border-radius: 0.8rem;
    }
    .top-menu-link:hover {
        background-color: var(--bg-3ish);
        box-shadow: 0px 1px 2px 1px var(--button-box-shadow-color);
    }
    .top-menu-link.current {
        color: var(--main);
        background-color: var(--bg-3ish);
        box-shadow: 0px 1px 2px 1px var(--button-box-shadow-color);
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

<main>
  <div class="grid page">
    <div class="content">
        <div class="top-menu-nav">
            <a class="top-menu-link {
                page?.data?.explorePage == "subjects" ?
                    "current" : ""
            }" href="/explore">Subjects</a>
            <a class="top-menu-link {
                page?.data?.explorePage == "recently-created" ?
                    "current" : ""
            }" href="/explore/recent">Recently Created</a>
            <a class="top-menu-link {
                page?.data?.explorePage == "recently-updated" ?
                    "current" : ""
            }" href="/explore/recent?updated">Recently Updated</a>
        </div>
        {#key data.exploreTransPageKey}
            <div style="margin-top: 1.4rem;" in:fade={{ duration: 120, delay: 120, easing: sineIn }} out:fade={{ duration: 120, easing: sineOut }}>
                {@render children()}
            </div>
        {/key}
    </div>
  </div>
</main>
