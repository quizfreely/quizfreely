<!--
See web/src/routes/settings/studying-algorithm/+page.svelte
(same UI, different functionality)

This is used by web/src/routes/studyset/local/review-mode/settings/+page.svelte
and web/src/routes/studysets/[id]/review-mode/settings/+page.svelte
-->

<script>
    let { data } = $props();
    import { onMount } from "svelte";

    import IconPencil from "$lib/icons/Pencil.svelte";
    import IconCheckmark from "$lib/icons/Checkmark.svelte";
    import IconTrash from "$lib/icons/Trash.svelte";
    import IconBackArrow from "$lib/icons/BackArrow.svelte";
    import { page } from "$app/state";
    import Noscript from "$lib/components/Noscript.svelte";
    import { openIndexedDB } from "$lib/indexedDB";
    var showInvalidReviewModeAcc = $state(false);
    var reviewModeChangesSaved = $state(false);
    
    onMount(function () {
        /* settings stored locally w IndexedDB if studyset is local OR if user isn't logged in (even if the studyset isn't local) */
        if (data.local || !data.authed) {
            openIndexedDB(function (db) {
                var dbTransaction = db.transaction(["studysets", "studysetsettings"]);
                var studysetsObjectStore = dbTransaction.objectStore("studysets");
                var studysetsettingsObjectStore = dbTransaction.objectStore("studysetsettings");
                var dbStudysetGetReq = studysetsObjectStore.get(data.localId);
                dbStudysetGetReq.onerror = function (event) {
                    alert("oopsie woopsie, indexeddb error");
                }
                dbStudysetGetReq.onsuccess = function (event) {
                    if (dbStudysetGetReq.result) {
                        var dbSettingsGetReq = studysetsettingsObjectStore.get(data.localId);
                        dbSettingsGetReq.onerror = function (event) {
                          alert("indexeddb error while trying to get studyset settings");
                        }
                        dbSettingsGetReq.onsuccess = function (event) {
                          if (dbSettingsGetReq.result == null) {
                            /* use global settings if no per-studyset settings set (if undefined) */
                            useGlobalSettings()
                          } else {
                            /* use loaded per-studyset settings */
                            loadedStudysetSettings(dbSettingsGetReq.result);
                          }
                        }
                    } else {
                      alert("studyset not found :(")
                    }
                }
            })
        } else {

        }
    })
    function useGlobalSettings() {
        if (window.localStorage) {
            var goodAcc = parseFloat(localStorage.getItem("quizfreely:settings.reviewMode.goodAcc"));
            var badAcc = parseFloat(localStorage.getItem("quizfreely:settings.reviewMode.badAcc"));
            if (goodAcc >= 1 && goodAcc <= 100) {
                document.getElementById("good-acc").value = goodAcc;
            }
            if (badAcc >= 0 && badAcc <= 100) {
                document.getElementById("bad-acc").value = badAcc;
            }
        }
    }
    function loadedStudysetSettings(studysetSettings) {
        var goodAcc = parseFloat(studysetSettings?.reviewMode?.goodAcc);
        var badAcc = parseFloat(studysetSettings?.reviewMode?.badAcc);
        if (goodAcc >= 1 && goodAcc <= 100) {
            document.getElementById("good-acc").value = goodAcc;
        }
        if (badAcc >= 0 && badAcc <= 100) {
            document.getElementById("bad-acc").value = badAcc;
        }
    }
    function updateReviewModeSettings(reviewModeSettings) {
        if (data.local || !data.authed) {
            openIndexedDB(function (db) {
                var dbTransaction = db.transaction(["studysets", "studysetsettings"], "readwrite");
                var studysetsObjectStore = dbTransaction.objectStore("studysets");
                var studysetsettingsObjectStore = dbTransaction.objectStore("studysetsettings");
                var dbStudysetGetReq = studysetsObjectStore.get(data.localId ?? data.studysetId);
                dbStudysetGetReq.onerror = function (event) {
                    alert("oopsie woopsie, indexeddb error");
                }
                dbStudysetGetReq.onsuccess = function (event) {
                    if (dbStudysetGetReq.result) {
                        var dbSettingsGetReq = studysetsettingsObjectStore.get(data.localId ?? data.studysetId);
                        dbSettingsGetReq.onerror = function (event) {
                          alert("indexeddb error while trying to get studyset settings");
                        }
                        dbSettingsGetReq.onsuccess = function (event) {
                            var studysetSettings;
                            if (dbSettingsGetReq.result == null) {
                                /* new, no existing settings */
                                var dbSettingsAddReq = studysetsettingsObjectStore.add({
                                    studyset_id: data.localId ?? data.studysetId,
                                    reviewMode: reviewModeSettings
                                })
                                dbSettingsAddReq.onsuccess = function () {
                                    console.log("Sucessfully added studyset settings")
                                }
                            } else {
                                /* w existing settings */
                                var dbSettingsPutReq = studysetsettingsObjectStore.put({
                                    ...dbSettingsGetReq.result,
                                    reviewMode: reviewModeSettings
                                }) 
                                dbSettingsPutReq.onsuccess = function () {
                                    console.log("Sucessfully updated studyset settings")
                                }
                            }
                        }
                    } else {
                      alert("studyset not found :(")
                    }
                }
            })
        }
    }
</script>
<style>
    .label-thingy {
        margin-bottom: 0px;
    }
    .input-thingy-container {
        display: flex;
        margin-top: 0.4rem;
        flex-direction: row;
        gap: 0.4rem;
        align-items: center;
        align-content: center;
    }
    .input-thingy {
        margin-top: 0px;
        max-width: 5rem;
    }
    .input-thingy-percent {
        margin-top: 0px;
    }

    /* from web/src/routes/settings/+layout.svelte */
    .settings-container {
        display: grid;
        gap: 1rem;
        grid-template-columns: 1fr 4fr;
        grid-template-rows: 1fr;
    }
    .settings-menu-link {
        margin-top: 0px;
        color: var(--fg1);
        padding: 0.4rem 0.8rem;
        border-radius: 0.8rem;
    }
    .settings-menu-link:hover {
        background-color: var(--bg3);
    }
    .settings-menu-link.current {
        color: var(--main);
        background-color: var(--bg3);
    }
    .settings-menu-link.current:hover {
        color: var(--main-alt);
    }
    .settings-menu-nav {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
    }

    @media only screen and (max-width: 800px) {
        .settings-container {
            grid-template-columns: 1fr;
            grid-template-rows: auto 1fr;
        }
        .settings-menu-nav {
            flex-direction: row;
            gap: 1rem;
            margin-bottom: 1rem;
        }
    }
</style>
<Noscript />
<div class="grid page">
<div class="content">
<div>
    {#if (data.local) }
    <a href="/studyset/local/review-mode?id={ data.localId }" class="button faint">
      <IconBackArrow /> Back
    </a>
    {:else}
    <a href="/studysets/{ data.studysetId }/review-mode" class="button faint">
      <IconBackArrow /> Back
    </a>
    {/if}
</div>
<div class="settings-container">
    <div>
        <div class="settings-menu-nav">
        <a href="#top" class="settings-menu-link current">
            For this studyset
        </a>
        <a href="/settings/studying-algorithm" class="settings-menu-link">
            For all studysets
        </a>
        </div>
    </div>
    <div class="box" style="margin-top:0px">
        <h4>Review Mode Settings</h4>
        <p class="label-thingy">
            "Good" accuracy<br>
            <span class="fg0">Default: &gt; 90%</span>
        </p>
        <div class="input-thingy-container">
            <input type="text" id="good-acc" class="input-thingy" placeholder="90" oninput={() => reviewModeChangesSaved = false}>
            <span class="input-thingy-percent">%</span>
        </div>
        <p class="label-thingy">
            "Bad" accuracy<br>
            <span class="fg0">Default: &lt; 80%</span>
        </p>
        <div class="input-thingy-container">
            <input type="text" id="bad-acc" class="input-thingy" placeholder="80" oninput={() => reviewModeChangesSaved = false}>
            <span class="input-thingy-percent">%</span>
        </div>
        <div class="box ohno { showInvalidReviewModeAcc ? "" : "hide" }">
            "Good" accuracy needs to be greater than "bad" accuracy.<br>
            Both need to be between 1 and 100
        </div>
        {#if reviewModeChangesSaved}
            <p class="fg0">Changes Saved</p>
        {/if}
        <div class="flex">
        <button onclick={function () {
        if (window.localStorage) {
            var newGoodAcc = parseFloat(document.getElementById("good-acc").value)
            var newBadAcc = parseFloat(document.getElementById("bad-acc").value)

            showInvalidReviewModeAcc = false;
            var newReviewModeSettings = {}
            
            if (newBadAcc >= 1 && newBadAcc <= 100 && (
                newGoodAcc > newBadAcc ||
                document.getElementById("good-acc").value == ""
            )) {
                newReviewModeSettings.badAcc = newBadAcc;
                document.getElementById("bad-acc").value = newBadAcc;
            } else if (document.getElementById("bad-acc").value != "") {
                showInvalidReviewModeAcc = true;
            }

            if (newGoodAcc >= 1 && newGoodAcc <= 100 && (
                newGoodAcc > newBadAcc ||
                document.getElementById("bad-acc").value == ""
            )) {
                newReviewModeSettings.goodAcc = newGoodAcc;
                document.getElementById("good-acc").value = newGoodAcc;
            } else if (document.getElementById("good-acc").value != "") {
                showInvalidReviewModeAcc = true;
            }

            if (!showInvalidReviewModeAcc) {
                updateReviewModeSettings(newReviewModeSettings)
                reviewModeChangesSaved = true;
            }
        }
        }}><IconCheckmark /> Save</button>
        </div>
    </div>
</div>
</div>
</div>
