<script>
    import { goto } from "$app/navigation";
    import QuizevilIcon from "$lib/icons/Quizevil.svelte";
    import ScholarsomeIcon from "$lib/icons/Scholarsome.svelte";
    import PlusIcon from "$lib/icons/Plus.svelte";
    let { data } = $props();

    async function newStudysetButtonWImport() {
        if (data.authed) {
            const raw = await fetch("/api/graphql", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    query: `mutation {
    createStudyset(
        studyset: {
            title: "",
            private: false
        },
        draft: true
    ) {
        id
    }
}`
                })
            });
            const res = await raw.json();
            goto(`/studyset/edit/${res?.data?.createStudyset?.id}?import`)
        } else {
            const id = await idbApiLayer.createStudyset({
                title: "",
                draft: true
            });
            goto(`/studyset/local/edit?id=${id}&import`)
        }
    }
</script>
<svelte:head>
    <title>Import to Quizfreely</title>
</svelte:head>
<div class="grid page">
    <div class="content">
        <h1 class="h3" style="margin-top: 2rem;">Import</h1>
        <p class="fg0">Import directly from a link</p>
        <div class="flex">
            <a href="/import/quizlet" class="button large button-box">
                <div class="flex" style="align-items: center; flex-wrap: nowrap;">
                    <QuizevilIcon width="2rem" height="2rem"></QuizevilIcon>
                    <span>Quizlet</span>
                </div>
            </a>
            <a href="/import/scholarsome" class="button large button-box">
                <div class="flex" style="align-items: center; flex-wrap: nowrap;">
                    <ScholarsomeIcon width="2rem" height="2rem"></ScholarsomeIcon>
                    <span>Scholarsome</span>
                </div>
            </a>
        </div>
        <div class="separator">or</div>
        <p class="fg0">Copy &amp; paste terms yourself</p>
        <div class="flex">
            <button class="button large button-box" onclick={newStudysetButtonWImport}>
                <div class="flex" style="align-items: center; flex-wrap: nowrap;">
                    <PlusIcon width="2rem" height="2rem"></PlusIcon>
                    <span>Import Terms</span>
                </div>
            </button>
        </div>
    </div>
</div>
