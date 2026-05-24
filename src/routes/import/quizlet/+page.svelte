<script>
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { slide, crossfade, fade } from "svelte/transition";
    import { idbApiLayer } from "$lib/idb-api-layer";
    import LinkIcon from "$lib/icons/Link.svelte";
    import PlusIcon from "$lib/icons/Plus.svelte";
    import GridIcon from "$lib/icons/AppsGrid.svelte"
    import QuizevilLogotype from "$lib/icons/QuizevilLogotype.svelte"
    let { data } = $props();

    let link = $state("");
    let textbox;
    let showErrMsg = $state(false);
    let showErrDetails = $state(false);
    let errMsgTxt = $state("");
    let errDetailsTxt = $state("");
    let showLoading = $state(false);
    let loadingMsgIndex = $state(-1);
    const loadingMsgs = [
        "This can take some time",
        "Still fetching & importing...",
        "This sometimes takes a while",
        "Still working...",
        "This typically takes less than 1 minute",
        "Still loading...",
        "This process might take a bit",
        "Sorry, still loading...",
        "Importing sometimes takes a while",
        "Sorry, still importing...",
        "This can take a bit sometimes",
        "Sorry, still loading...",
        "So sorry, this is taking a while",
        "So sorry, still loading..."
    ];
    async function importButton() {
        showErrMsg = false;
        showErrDetails = false;
        showLoading = false;
        loadingMsgIndex = -1;
        if (link == null || link.length == 0) {
            errMsgTxt = "Empty link! Paste a link to import."
            showErrMsg = true;
            return;
        }
        
        const url = normalizeUrlHttps(link);
        if (url === null) {
            errMsgTxt = "Invalid Link!"
            showErrMsg = true;
            return;
        }

        showLoading = true;
        const loadingMsgInterval = setInterval(() => {
            if (loadingMsgIndex >= loadingMsgs.length - 1) {
                clearInterval(loadingMsgInterval);
            } else {
                loadingMsgIndex++;
            }
        }, 6000);
        await importTerms(url);
        showLoading = false;
        clearInterval(loadingMsgInterval);
    }
    async function importTerms(url) {
        let title;
        let terms;
        try {
            const rawResp = await fetch("/api/web-import", {
                method: "POST",
                body: JSON.stringify({
                    url
                })
            });
            const resp = await rawResp.json();
            if (resp.error != null && resp.errorMsg != null) {
                errMsgTxt = resp.errorMsg;
                showErrMsg = true;
                return;
            } else if (resp.error != null) {
                errMsgTxt = "Error importing terms!";
                errDetailsTxt = resp.error;
                showErrMsg = true;
                showErrDetails = true;
                return;
            } else {
                terms = resp.terms;
                title = resp.title;
            }
        } catch (err) {
            console.error("Error making web import API req", err);
            errMsgTxt = "Error connecting to server to import terms";
            showErrMsg = true;
            if (err?.message) {
                errDetailsTxt = err.message;
                showErrDetails = true;
            }
            return;
        }

        if (terms.length == 0) {
            errMsgTxt = "Sorry, it couldn't find any terms to copy :("
            showErrMsg = true;
            return;
        }

        title = title?.trim();
        title = title?.length > 0 ? title : "Imported Studyset"

        const termInputs = terms.map(([term, def], index) => ({
            term,
            def,
            sortOrder: index
        }));
        if (data.authed) {
            let newStudysetId;
            try {
                const rawResp = await fetch("/api/graphql", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        query: `mutation CreateImportedStudyset($title: String!) {
    createStudyset(studyset: {
        title: $title,
        private: false
    }, draft: false) {
        id
    }
}`,
                        variables: {
                            title
                        }
                    })
                });
                const resp = await rawResp.json();
                if (resp?.data?.createStudyset?.id == null) {
                    console.error("Error creating studyset with imported terms", resp);
                    errMsgTxt = "Error creating studyset with imported terms";
                    showErrMsg = true;
                    return;
                }
                newStudysetId = resp.data.createStudyset.id;

                const rawTermsResp = await fetch("/api/graphql", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        query: `mutation AddImportedTerms($studysetId: ID!, $terms: [NewTermInput!]!) {
    createTerms(studysetId: $studysetId, terms: $terms) {
        id
    }
}`,
                        variables: {
                            studysetId: newStudysetId,
                            terms: termInputs
                        }
                    })
                });
                const termsResp = await rawTermsResp.json();
                if (termsResp?.data?.createTerms == null) {
                    console.error("Error creating imported terms", termsResp);
                    errMsgTxt = "Error adding imported terms";
                    showErrMsg = true;
                    return;
                }
                goto(`/studysets/${newStudysetId}`);
            } catch (err) {
                console.error("Error making API req(s) creating studyset/terms after import", err);
                errMsgTxt = "Error creating studyset with imported terms";
                showErrMsg = true;
                return;
            }
        } else {
            try {
                const newLocalId = await idbApiLayer.createStudyset({
                    title,
                    draft: false
                });
                await idbApiLayer.createTerms(newLocalId, termInputs);
                goto(`/studyset/local?id=${newLocalId}`);
            } catch (err) {
                console.error("Error creating local studyset/terms after import", err);
                errMsgTxt = "Error creating local studyset with imported terms";
                showErrMsg = true;
                return;
            }
        }
    }

    /*
        returns input string as url with https protocol or returns null if invalid
        will change http to https & will add protocol if input has none
        will return null (invalid) if protocol is specified but is not http or https
        ignores surrounding whitespace
        will return null (invalid) if string is empty or only whitespace
        will return null (invalid) if hostname has no dots, this markes things like localhost urls invalid (web APIs will not be able to retrieve them anyway)
    */
    function normalizeUrlHttps(input) {
        if (typeof input !== "string") {
            return null;
        }

        let url = input.trim();

        if (url.length == 0) {
            return null;
        }

        if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(url)) {
            url = `https://${url}`;
        }

        try {
            const urlObj = new URL(url);

            if (!urlObj.hostname.includes(".")) {
                return null;
            }

            if (urlObj.hostname.endsWith(".")) {
                return null;
            }

            if (urlObj.protocol == "https:") {
                return urlObj.toString();
            } else if (urlObj.protocol == "http:") {
                urlObj.protocol = "https:";
                return urlObj.toString();
            } else {
                return null;
            }
        } catch (err) {
            console.error("error parsing url in normalizeUrlHttps", err);
            return null;
        }
    }

    function keyupFunc(event) {
        if (event.key == "Enter") {
            importButton();
        }
    }
    onMount(() => {
        textbox.addEventListener("keyup", keyupFunc);
        return () => {
            textbox.removeEventListener("keyup", keyupFunc);
        };
    });
    const [crossfadeOut, crossfadeIn] = crossfade({
        duration: 800,
        fallback: (node, _params, _intro) => fade(node, {
            duration: 400
        })
    });
</script>
<svelte:head>
  <title>Import Quizlet Sets to Quizfreely</title>
</svelte:head>
<div class="grid intro" style="border-bottom: none; gap: 1rem;">
    <div class="content">
        <span class="b" style="font-size: 1.6rem;">Import from</span>
        <div class="flex" style="align-items: center; justify-content: center; gap: 1.2rem; margin-top: 0.4rem;">
            <QuizevilLogotype width="auto" height="2.2rem" role="img" aria-label="Quizlet"></QuizevilLogotype>
        </div>
        <div class="flex" style="flex-direction: column; align-items: center;">
            <div class="flex" style="flex-direction: column; align-items: stretch; width: 26rem;">
                <p style="font-size: 1.2rem; margin-top: 2rem; text-align: start;">Paste a link below</p>
                <div class="searchbar" style="width: 100%; margin-bottom: 0px; box-shadow: 0px 1px 2px 1px var(--button-box-shadow-color);">
                    <LinkIcon class="searchbar-icon"></LinkIcon>
                    <input type="text" placeholder="https://quizlet.com/1234..." autocomplete="off" autocapitalize="off" spellcheck="false" bind:value={link} bind:this={textbox}>
                </div>
                <button onclick={importButton} style="{showLoading ? "opacity: 0.6;" : ""}" disabled={showLoading}>
                    <PlusIcon></PlusIcon>
                    {showLoading ? "Importing..." : "Import"}
                </button>
                <div style="min-height: 2rem;">
                {#if showErrMsg}
                <div class="box ohno" transition:slide>
                    <p>{errMsgTxt}</p>
                    {#if showErrDetails}
                    <p class="fg0">{errDetailsTxt}</p>
                    {/if}
                </div>
                {/if}
                {#if showLoading}
                    <div class="flex" style="margin-top: 2rem; align-items: center; justify-content: center; gap: 1.2rem;" transition:slide>
                        <div class="spinner size-1.2rem fg1 speed-slower"></div>
                        <span style="font-size: 1.4rem;">Loading</span>
                    </div>
                    {#if loadingMsgIndex >= 0}
                        <div class="grid overlap-loading-msg-container" transition:fade={{ duration: 400 }}>
                            {#each [loadingMsgs[loadingMsgIndex]] as loadingMsg (loadingMsgIndex)}
                                <p class="fg0 center overlap-loading-msg" in:crossfadeIn={{
                                    key: loadingMsgIndex
                                }} out:crossfadeOut={{
                                    key: loadingMsgIndex
                                }}>{loadingMsg}</p>
                            {/each}
                        </div>
                    {/if}
                {/if}
                </div>
                <div style="margin-top: 2rem; text-align: start;">
                    <p class="fg0">Import terms from other sources?</p>
                    <a href="/import" class="button alt text fg1" style="margin-top: 0.4rem;">
                        <GridIcon></GridIcon>
                        More Import Options
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>
<!-- <div class="grid page"> -->
<!--     <div class="content"> -->
<!--     </div> -->
<!-- </div> -->
<style>
.overlap-loading-msg-container {
    grid-template-areas: "stack";
}
.overlap-loading-msg {
    grid-area: stack;
}
</style>
