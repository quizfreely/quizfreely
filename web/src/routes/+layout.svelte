<script>
import Header from "$lib/components/Header.svelte";
import Footer from "$lib/components/Footer.svelte";
import { fade } from "svelte/transition";
import NProgress from "nprogress";
import "$lib/nprogress/modified-nprogress.css";
import { beforeNavigate, afterNavigate } from "$app/navigation";
let { children, data } = $props();

NProgress.configure({
    showSpinner: false
});
let timeout;
beforeNavigate(function () {
    if (timeout) {
        clearTimeout(timeout);
    }
    timeout = setTimeout(function () {
        NProgress.start();
    }, 200);
})
afterNavigate(function () {
    if (timeout) {
        clearTimeout(timeout);
    }
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

