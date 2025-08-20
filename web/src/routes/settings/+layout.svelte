<script>
    import { page } from "$app/state";
    import { fade } from "svelte/transition";
    import { sineIn, sineOut } from "svelte/easing";
    import Noscript from "$lib/components/Noscript.svelte";
    import IconBackArrow from "$lib/icons/BackArrow.svelte";
    let { children, data } = $props();
</script>
<style>
    .settings-container {
        display: grid;
        gap: 1rem;
        grid-template-columns: 1fr 4fr;
        grid-template-rows: 1fr;
    }
    .settings-menu-link {
        margin-top: 0px;
        color: var(--fg-1);
        padding: 0.4rem 0.8rem;
        border-radius: 0.8rem;
    }
    .settings-menu-link:hover {
        background-color: var(--bg-3);
    }
    .settings-menu-link.current {
        color: var(--main);
        background-color: var(--bg-3);
    }
    .settings-menu-link.current:hover {
        color: var(--main-alt);
    }
    .settings-menu-nav {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
        align-items: stretch;
    }
    .settings-title-show-on-mobile-only {
        display: none;
    }
    @media only screen and (max-width: 800px) {
        .settings-container {
            grid-template-columns: 1fr;
            grid-template-rows: auto 1fr;
        }
        .settings-menu-nav {
            flex-direction: row;
            gap: 1rem;
            margin-bottom: 1rem;
            align-items: center;
        }
        .settings-title-show-on-mobile-only {
            display: block;
        }
    }
</style>

<svelte:head>
  <title>Quizfreely Settings</title>
</svelte:head>

<Noscript />

<div class="grid page">
    <div class="content">
<div class="settings-container">
    <div>
        <h4 class="center settings-title-show-on-mobile-only">Settings</h4>
        <div class="settings-menu-nav">
            <a href="/settings" class="settings-menu-link {page.data.settingsSection == "general" ? "current" : ""}">
                General
            </a>
            <a href="/settings/account" class="settings-menu-link {page.data.settingsSection == "account" ? "current" : ""}">
                Account
            </a>
        </div>
    </div>
    <div style="margin-top:0px">
        {#key data.settingsTransPageKey}
            <div in:fade={{ duration: 140, delay: 140, easing: sineIn }} out:fade={{ duration: 140, easing: sineOut }}>
                {@render children()}
            </div>
        {/key}
    </div>
</div>
</div>
</div>
