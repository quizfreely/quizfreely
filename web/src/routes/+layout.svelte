<script>
import Header from "$lib/components/Header.svelte";
import Footer from "$lib/components/Footer.svelte";
import { fade } from "svelte/transition";
let { children, data } = $props();
</script>

<Header />
{#key data.urlPathname}
<div in:fade={{ duration: 140, delay: 140 }} out:fade={{ duration: 140 }}>
    <div style="min-height: 70vh">
        {@render children()}
    </div>
    <Footer />
</div>
{/key}
