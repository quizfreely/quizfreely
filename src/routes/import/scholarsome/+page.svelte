<script>
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { slide } from "svelte/transition";
    import { idbApiLayer } from "$lib/idb-api-layer";
    import LinkIcon from "$lib/icons/Link.svelte";
    import CheckmarkIcon from "$lib/icons/Checkmark.svelte";
    import GridIcon from "$lib/icons/AppsGrid.svelte"
    import ScholarsomeLogotype from "$lib/svg/ScholarsomeLogotype.svelte"
    let { data } = $props();

    let link = $state("");
    let textbox;
    let showErrMsg = $state(false);
    let showErrDetails = $state(false);
    let errMsgTxt = $state("");
    let errDetailsTxt = $state("");
    let showLoading = $state(false);
    async function importButton() {
        showErrMsg = false;
        showErrDetails = false;
        showLoading = false;
        if (link == null || link.trim().length == 0) {
            errMsgTxt = "Empty link! Paste a link to import."
            showErrMsg = true;
            return;
        }
        
        const url = parseUrl(link);
        if (url === null) {
            errMsgTxt = "Invalid Link!"
            showErrMsg = true;
            return;
        }
        const pathBeforeIdStartIndex = url.pathname.indexOf("/study-set/");
        const pathBeforeIdIndex = pathBeforeIdStartIndex + ("/study-set/").length;
        if (pathBeforeIdStartIndex < 0 || pathBeforeIdIndex >= url.pathname.length - 1) {
            errMsgTxt = "Invalid Link!"
            showErrMsg = true;
            return;
        }
        const pathBeforeId = url.pathname.substring(0, pathBeforeIdIndex).trim();
        const pathWithAndAfterId = url.pathname.substring(pathBeforeIdIndex).trim();
        if (pathWithAndAfterId.length < 1) {
            errMsgTxt = "Invalid Link!"
            showErrMsg = true;
            return;
        }
        const pathPartsWithAndAfterId = pathWithAndAfterId.split("/");
        if (pathPartsWithAndAfterId.length == 0 || pathPartsWithAndAfterId[0].trim().length < 1) {
            errMsgTxt = "Invalid Link!"
            showErrMsg = true;
            return;
        }
        const studysetId = pathPartsWithAndAfterId[0].trim();
        url.pathname = pathBeforeId.replace("/study-set/", "/api/sets/") + studysetId;
        url.hash = "";
        url.search = "";

        // navigator.sendBeacon("/medama/api/event/hit", JSON.stringify({
        //     b: window.medama.uid,
        //     e: "custom",
        //     g: window.location.hostname,
        //     d: {
        //         import_start: "scholarsome"
        //     }
        // }));

        showLoading = true;
        await importTerms(url.toString());
        showLoading = false;
    }
    async function importTerms(apiUrl) {
        let title;
        let terms;
        try {
            const rawResp = await fetch(apiUrl);
            const resp = await rawResp.json();
            if (resp == null) {
                errMsgTxt = "Error importing terms!";
                errDetailsTxt = "Empty API response";
                showErrMsg = true;
                showErrDetails = true;
                return;
            } else if (rawResp.status == 404 && resp.message.length > 0) {
                errMsgTxt = "Studyset not found";
                errDetailsTxt = resp.message;
                showErrMsg = true;
                showErrDetails = true;
                return;
            } else if (rawResp.status == 404) {
                errMsgTxt = "API responded with 404 Not Found";
                showErrMsg = true;
                return;
            } else if (rawResp.status != 200 && resp.message.length > 0) {
                errMsgTxt = "API responded with an error";
                errDetailsTxt = resp.message;
                showErrMsg = true;
                showErrDetails = true;
                return;
            } else if (resp?.data?.cards != null) {
                title = resp.data.title;
                const parser = new DOMParser();
                terms = resp.data.cards.map((card, index) => {
                    if (card == null) {
                        return {
                            term: "",
                            def: "",
                            sortOrder: index
                        };
                    }

                    let term = card.term;
                    let def = card.definition;
                    if (card.term?.trim()?.length > 0) {
                        const doc = parser.parseFromString(card.term, "text/html");
                        term = doc.body.textContent || "";
                    }
                    if (card.definition?.trim()?.length > 0) {
                        const doc = parser.parseFromString(card.definition, "text/html");
                        def = doc.body.textContent || "";
                    }
                    return {
                        term,
                        def,
                        sortOrder: card.index
                    };
                });
            } else {
                errMsgTxt = "API response doesn't have terms";
                errDetailsTxt = JSON.stringify(resp, null, 4);
                showErrMsg = true;
                showErrDetails = true;
                return;
            }
        } catch (err) {
            console.error("Error making scholarsome API req", err);
            errMsgTxt = "Error connecting to API to import terms";
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
                            terms
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
                // if (env.ENABLE_MEDAMA == "true") {
                //     navigator.sendBeacon("/medama/api/event/hit", JSON.stringify({
                //         b: window.medama.uid,
                //         e: "custom",
                //         g: window.location.hostname,
                //         d: {
                //             import_success: "scholarsome, cloud",
                //         }
                //     }));
                // }
                goto(`/studysets/${newStudysetId}`);
            } catch (err) {
                console.error("Error making (qzfr) API req(s) creating studyset/terms after import", err);
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
                await idbApiLayer.createTerms(newLocalId, terms);
                // if (env.ENABLE_MEDAMA == "true") {
                //     navigator.sendBeacon("/medama/api/event/hit", JSON.stringify({
                //         b: window.medama.uid,
                //         e: "custom",
                //         g: window.location.hostname,
                //         d: {
                //             import_success: "scholarsome, local",
                //         }
                //     }));
                // }
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
        returns input string as URL object or returns null if invalid
        will add https protocol if input has no protocol, will keep http if input has it
        will return null (invalid) if protocol is specified but is not http or https
        ignores surrounding whitespace
        will return null (invalid) if input is empty or only whitespace
    */
    function parseUrl(input) {
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

            if (urlObj.protocol == "https:" || urlObj.protocol == "http:") {
                return urlObj;
            } else {
                return null;
            }
        } catch (err) {
            console.error("error parsing url in parseUrl", err);
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
</script>
<svelte:head>
  <title>Import Scholarsome Sets to Quizfreely</title>
</svelte:head>
<div class="grid intro" style="border-bottom: none; gap: 1rem;">
    <div class="content">
        <span class="b" style="font-size: 1.6rem;">Import from</span>
        <div class="flex" style="align-items: center; justify-content: center; gap: 1.2rem; margin-top: 0.4rem;">
            <ScholarsomeLogotype style="width: auto; height: 3.6rem;" role="img" aria-label="Scholarsome"></ScholarsomeLogotype>
        </div>
        <div class="flex" style="flex-direction: column; align-items: center;">
            <div class="flex" style="flex-direction: column; align-items: stretch; width: 26rem; max-width: 100%;">
                <p style="font-size: 1.2rem; margin-top: 2rem; text-align: start;">Paste a link below</p>
                <div class="searchbar" style="width: 100%; margin-bottom: 0px; box-shadow: 0px 1px 2px 1px var(--button-box-shadow-color);">
                    <LinkIcon class="searchbar-icon"></LinkIcon>
                    <input type="text" placeholder="https://scholarsome.com/study-set/..." autocomplete="off" autocapitalize="off" spellcheck="false" bind:value={link} bind:this={textbox}>
                </div>
                <button onclick={importButton} style="{showLoading ? "opacity: 0.6;" : ""}" disabled={showLoading}>
                    <CheckmarkIcon></CheckmarkIcon>
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
