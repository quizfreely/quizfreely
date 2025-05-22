<script>
import Header from "$lib/components/Header.svelte";
import Footer from "$lib/components/Footer.svelte";
import { fade } from "svelte/transition";
import NProgress from "nprogress";
import "$lib/nprogress/modified-nprogress.css";
import { beforeNavigate, afterNavigate } from "$app/navigation";
import { nprogressTimeout, cancelNprogressTimeout } from "$lib/stores/nprogressTimeout.js";
import { get } from "svelte/store";
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

<Header />
{#key data.transPageKey}
<div in:fade={{ duration: 140, delay: 140 }} out:fade={{ duration: 140 }}>
    <div style="min-height: 70vh">
        {@render children()}
    </div>
    <Footer />
</div>
{/key}

