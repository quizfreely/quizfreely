<script>
import Header from "$lib/components/Header.svelte";
import Footer from "$lib/components/Footer.svelte";
import { fade } from "svelte/transition";
import { sineIn, sineOut } from "svelte/easing";
import NProgress from "nprogress";
import "$lib/nprogress/modified-nprogress.css";
import { beforeNavigate, afterNavigate } from "$app/navigation";
import { footerState } from '$lib/components/footer.svelte.js';
import { page } from '$app/state';
import { env } from "$env/dynamic/public";
import { getCancelBeforeNavigate } from "$lib/cancel-before-navigate.js";
let { children, data } = $props();
const ENABLE_UMAMI = env.ENABLE_UMAMI === "true";

NProgress.configure({
    showSpinner: false
});
let nprogressTimeout;
beforeNavigate((nav) => {
    clearTimeout(nprogressTimeout);
    nprogressTimeout = undefined;

    /* if a page might cancel navigation, it puts its beforeNavigate logic in cancelBeforeNavigate (which is a shared state)
    it returns true if it cancelled navigation to stop the rest of this layout's beforeNavigate, like nprogress */
    if (getCancelBeforeNavigate()?.(nav) === true) {
        return;
    }

    nprogressTimeout = setTimeout(() => {
        NProgress.start();
    }, 200);
})
afterNavigate(nav => {
    clearTimeout(nprogressTimeout);
    nprogressTimeout = undefined;
    NProgress.done();

    if (window?.umami != null && page?.data?.authed) {
        window.umami.identify({
            id: page?.data?.authedUser?.id,
            displayName: page?.data?.authedUser?.displayName,
            username: page?.data?.authedUser?.username,
            authType: page?.data?.authedUser?.authType,
            oauthGoogleEmail: page?.data?.authedUser?.oauthGoogleEmail,
            authed: page?.data?.authed
        });
    }
    if (window?.umami != null && nav.type !== "enter") {
        window.umami.track();
    }
})
</script>
<svelte:head>
    {#if ENABLE_UMAMI}
        <script
            defer
            src="/umami/script.js"
            data-website-id="{env.UMAMI_SITE_ID}"
            data-auto-track="false"
            data-performance="true"
            onload="window.umami.track()"
        ></script>
    {/if}
</svelte:head>

{#if !page?.data?.header?.hideHeader}
<Header />
{/if}
{#key data.transPageKey}
<div data-m:load={page?.data?.authed ? "authed=true" : "authed=false"} in:fade={{ duration: 120, delay: 120, easing: sineIn }} out:fade={{ duration: 120, easing: sineOut }}>
    <div style="min-height: 70vh">
        {@render children()}
    </div>
    {#if !page?.data?.footer?.hideFooter && !footerState?.hideFooter}
    <Footer />
    {/if}
</div>
{/key}

