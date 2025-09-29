<script>
    import Noscript from "$lib/components/Noscript.svelte";
    let { data } = $props();
</script>

<svelte:head>
  <title>Quizfreely</title>
</svelte:head>

<Noscript />
<div>
    {#if !data.authed}
        <p id="dashboard-noaccount-alert" class="fg0">
            You're not signed in, so your sets will be saved locally (on your device)
        </p>
    {/if}
    <div class="flex">
        <a href="/studyset/create" class="button">
            <IconPlus />
            Create new
        </a>
    </div>

    {#snippet emptyMsg()}
        <div class="box flex center-h center-v">
            <div>Tap "create new" to create a studyset</div>
        </div>
    {/snippet}
    <StudysetList
        {data}
        cloudLinkTemplateFunc={(id) => `/studysets/${id}`}
        localLinkTemplateFunc={(id) => `/studyset/local?id=${id}`}
        cloudEmptyMsg={emptyMsg}
        localEmptyMsg{emptyMsg}
    ></StudysetList>
</div>
