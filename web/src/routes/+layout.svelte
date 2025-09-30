<script>
import Header from "$lib/components/Header.svelte";
import Footer from "$lib/components/Footer.svelte";
import { fade } from "svelte/transition";
import { sineIn, sineOut } from "svelte/easing";
import NProgress from "nprogress";
import "$lib/nprogress/modified-nprogress.css";
import { beforeNavigate, afterNavigate } from "$app/navigation";
import { nprogressTimeout, cancelNprogressTimeout } from "$lib/stores/nprogressTimeout.js";
import { get } from "svelte/store";
import { footerState } from '$lib/components/footer.svelte.js';
import { page } from '$app/state';
let { children, data } = $props();

NProgress.configure({
    showSpinner: false
});
beforeNavigate(function () {
    const currentTimeout = get(nprogressTimeout);
    if (currentTimeout) {
        clearTimeout(currentTimeout);
    }
    nprogressTimeout.set(
        setTimeout(function () {
            NProgress.start();
        }, 200)
    );
})
afterNavigate(function () {
    cancelNprogressTimeout();
    NProgress.done();
})
</script>

{#if !page?.data?.header?.hideHeader}
<Header />
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

