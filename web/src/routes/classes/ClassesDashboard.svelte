<script>
    import Noscript from "$lib/components/Noscript.svelte";
    let { data } = $props();
</script>

<svelte:head>
    <title>Quizfreely Classes</title>
</svelte:head>

<Noscript />
<main>
    <div class="grid page">
        <div class="content">
            {JSON.stringify(
                data.classesData
            )}
        </div>
    </div>
</main>

