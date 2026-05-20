<script>
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { slide } from "svelte/transition";
    import { idbApiLayer } from "$lib/idb-api-layer";
    import LinkIcon from "$lib/icons/Link.svelte";
    import PlusIcon from "$lib/icons/Plus.svelte";
    let { data } = $props();

    let link = $state("");
    let textbox;
    let showErrMsg = $state(false);
    let showErrDetails = $state(false);
    let errMsgTxt = $state("");
    let errDetailsTxt = $state("");
    async function importButton() {
        console.log(link)
        console.log(normalizeUrlHttps(link))
        showErrMsg = false;
        showErrDetails = false;
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
    }, draft: false): {
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
                            studysetId: resp.data.createStudyset.id,
                            terms: termInputs
                        }
                    })
                });
                const termsResp = await rawTermsResp.json();
                if (resp?.data?.createTerms == null) {
                    console.error("Error creating imported terms", termsResp);
                    errMsgTxt = "Error adding imported terms";
                    showErrMsg = true;
                    return;
                }
                goto(`/studysets/${resp.data.createStudyset.id}`);
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
        }
    })
</script>
<svelte:head>
  <title>Import From Quizlet to Quizfreely</title>
</svelte:head>
<div class="grid intro" style="border-bottom: none;">
    <div class="content">
        <h1 class="h2">Import from Quizlet</h1>
        <div class="flex" style="flex-direction: column; align-items: center;">
            <div class="flex" style="flex-direction: column; align-items: stretch;">
                <p style="font-size: 1.2rem; margin-top: 2rem; text-align: start;">Paste a link below</p>
                <div class="searchbar" style="min-width: 24rem; max-width: 30rem; margin-bottom: 0px; box-shadow: 0px 1px 2px 1px var(--button-box-shadow-color);">
                    <LinkIcon class="searchbar-icon"></LinkIcon>
                    <input type="text" placeholder="https://quizlet.com/1234..." autocomplete="off" autocapitalize="off" spellcheck="false" bind:value={link} bind:this={textbox}>
                </div>
                <button onclick={importButton}>
                    <PlusIcon></PlusIcon>
                    Import
                </button>
                {#if showErrMsg}
                <div class="box ohno" transition:slide>
                    <p>{errMsgTxt}</p>
                    {#if showErrDetails}
                    <p class="fg0">{errDetailsTxt}</p>
                    {/if}
                </div>
                {/if}
            </div>
        </div>
    </div>
</div>
<!-- <div class="grid page"> -->
<!--     <div class="content"> -->
<!--     </div> -->
<!-- </div> -->
