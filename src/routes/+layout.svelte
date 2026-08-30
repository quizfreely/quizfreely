<script>
import Header from "$lib/components/Header.svelte";
import Footer from "$lib/components/Footer.svelte";
import "../app.css";
import { fade, slide } from "svelte/transition";
import { sineIn, sineOut } from "svelte/easing";
import NProgress from "nprogress";
import "$lib/nprogress/modified-nprogress.css";
import { beforeNavigate, afterNavigate } from "$app/navigation";
import { footerState } from '$lib/components/footer.svelte.js';
import { page } from '$app/state';
import { getCancelBeforeNavigate } from "$lib/cancel-before-navigate.js";
import { env } from "$env/dynamic/public";
import { onMount } from "svelte";
import { studysetSelection, selectionUI } from "$lib/studyset-selection.svelte.js";
let { children, data } = $props();

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
    } else if (window?.umami != null) {
        window.umami.identify({
            authed: false
        });
    }
    if (window?.umami != null && nav.type !== "enter") {
        window.umami.track(payload => ({
            ...payload,
            title: document.title,
            url: window.location.href
        }));
    }
})

onMount(() => {
    /* store timezone in cookie for use in charts
    like reviewEventCountsByDay which is segmented by days
    and needs the user's timezone to calculate each day's cutoff
    correctly in the backend, which will use this tz cookie */
    try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        if (!tz) return;

        const cookieName = "tz";
        const cookieValue = encodeURIComponent(tz);
        const maxAge = 60 * 60 * 24 * 365; // 1 year in seconds

        document.cookie = `${cookieName}=${cookieValue}; max-age=${maxAge}; path=/; SameSite=Lax; Secure`;
    } catch (error) {
        console.error("Failed to detect or save timezone:", error);
    }

    studysetSelection.readSessionStorage();
})

let selectionLinkParams = $derived(
    [
        Array.from(studysetSelection.cloudIds, id => `studyset=${id}`).join("&"),
        Array.from(studysetSelection.localIds, id => `localStudyset=${id}`).join("&")
    ].filter(Boolean).join("&"),
    /* use Boolean to filter out empty strings,
    preventing duplicate ampersands if any set is empty */
);
</script>

{#if !page?.data?.header?.hideHeader}
<Header />
{/if}
{const totalSelectedCount = $derived(studysetSelection.cloudIds.size + studysetSelection.localIds.size)}
{#if totalSelectedCount > 0 && !page?.data?.studysetSelection?.hideSubHeader && !page?.data?.header?.hideHeader}
<div class="grid page" transition:slide={{duration:400}}>
    <div class="content">
        <div class="box flex {page?.data?.studysetSelection?.subHeaderClass ?? ''}" style="padding: 0.4rem 0.8rem; justify-content: space-between; align-items: center; column-gap: 1rem; row-gap: 0.2rem; {page?.data?.studysetSelection?.subHeaderStyle ?? ''}">
            <div style="padding: 0.6rem 0.8rem;">{totalSelectedCount} {totalSelectedCount == 1 ? "studyset" : "studysets"} selected</div>
            <div class="flex compact-gap">
                <a class="button faint" href="/combine?{selectionLinkParams}">Continue</a>
                <button class="ohno faint" onclick={() => {
                    studysetSelection.clearSelection();
                    selectionUI.getCancelButtonCallback()?.();
                }}>Cancel</button>
            </div>
        </div>
    </div>
</div>
{/if}
{#key data.transPageKey}
<div in:fade={{ duration: 120, delay: 120, easing: sineIn }} out:fade={{ duration: 120, easing: sineOut }}>
    <div style="min-height: 70vh">
        {@render children()}
    </div>
    {#if !page?.data?.footer?.hideFooter && !footerState?.hideFooter}
    <Footer />
    {/if}
</div>
{/key}

