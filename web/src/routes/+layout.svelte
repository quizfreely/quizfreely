<script>
import Header from "$lib/components/Header.svelte";
import Footer from "$lib/components/Footer.svelte";
import { fade } from "svelte/transition";
import { SvelteKitTopLoader } from "sveltekit-top-loader";
let { children, data } = $props();
</script>

<SvelteKitTopLoader color="var(--main)" showSpinner={false}/>
<Header />
{#key data.transPageKey}
<div in:fade={{ duration: 140, delay: 140 }} out:fade={{ duration: 140 }}>
    <div style="min-height: 70vh">
        {@render children()}
    </div>
    <Footer />
</div>
{/key}
