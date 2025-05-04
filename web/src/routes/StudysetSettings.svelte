<!--
See web/src/routes/settings/studying-algorithm/+page.svelte
(same UI, different functionality)

This is used by web/src/routes/studyset/local/settings/+page.svelte
and web/src/routes/studysets/[id]/settings/+page.svelte
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
                var dbTransaction = db.transaction(["studysetsettings"]);
                var studysetsettingsObjectStore = dbTransaction.objectStore("studysetsettings");
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
            })
        } else {
            fetch("/api/graphql", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                query: `query getStudysetAndSettings($id: ID!) {
                  studyset(id: $id) {
                    user_id
                  }
                  studysetSettings(studysetId: $id) {
                    goodAcc
                    badAcc
                    learningMinSessionsCount
                  }
                 }`,
                variables: {
                  "id": data.studysetId
                }
              })
            }).then(function (rawApiRes) {
              rawApiRes.json().then(function (apiResponse) {
                if (
                  apiResponse.data &&
                  apiResponse.data.studyset
                ) {
                  if (apiResponse.data.studysetSettings && apiResponse.data.studysetSettings.reviewMode) {
                    loadedStudysetSettings(apiResponse.data.studysetSettings)
                  } else {
                    useGlobalSettings()
                  }
                } else {
                  if (apiResponse.errors) {
                    console.log(apiResponse.errors);
                  }
                  alert("oh no, studyset failed to load");
                }
              }).catch(function (error) {
                console.error(error);
              })
            }).catch(function (error) {
              console.error(error);
            })
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
        useGlobalSettings()
        var goodAcc = parseFloat(studysetSettings?.goodAcc);
        var badAcc = parseFloat(studysetSettings?.badAcc);
        if (goodAcc >= 1 && goodAcc <= 100) {
            document.getElementById("good-acc").value = goodAcc;
        }
        if (badAcc >= 0 && badAcc <= 100) {
            document.getElementById("bad-acc").value = badAcc;
        }
    }
    /* example:
    updateReviewModeSettings(
        { goodAcc: 90, badAcc: 80 },
        function (success) {
            if (success) { console.log("yay") }
        }
    ) */
    function updateReviewModeSettings(studysetSettingsParam, callback) {
        if (data.local || !data.authed) {
            openIndexedDB(function (db) {
                var dbTransaction = db.transaction(["studysetsettings"], "readwrite");
                var studysetsettingsObjectStore = dbTransaction.objectStore("studysetsettings");
                var dbSettingsGetReq = studysetsettingsObjectStore.get(data.localId ?? data.studysetId);
                dbSettingsGetReq.onerror = function (event) {
                  alert("indexeddb error while trying to get studyset settings");
                  callback(false)
                }
                dbSettingsGetReq.onsuccess = function (event) {
                    if (dbSettingsGetReq.result == null) {
                        /* new, no existing settings */
                        var dbSettingsAddReq = studysetsettingsObjectStore.add({
                            studyset_id: data.localId ?? data.studysetId,
                            settings: studysetSettingsParam
                        })
                        dbSettingsAddReq.onsuccess = function () {
                            console.log("Sucessfully added studyset settings")
                            callback(true)
                        }
                    } else {
                        /* w existing settings */
                        var dbSettingsPutReq = studysetsettingsObjectStore.put({
                            ...dbSettingsGetReq.result,
                            settings: studysetSettingsParam
                        }) 
                        dbSettingsPutReq.onsuccess = function () {
                            console.log("Sucessfully updated studyset settings")
                            callback(true)
                        }
                    }
                }
            })
        } else {
            fetch("/api/graphql", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                query: `mutation updateStudysetSettings($id: ID!, $settings: StudysetSettingsInput!) {
                  updateStudysetSettings(
                    studysetId: $id
                    changedSettings: $settings
                  ) {
                    goodAcc
                    badAcc
                  }
                 }`,
                variables: {
                  "id": data.studysetId,
                  "settings": studysetSettingsParam
                }
              })
            }).then(function (rawApiRes) {
              rawApiRes.json().then(function (apiResponse) {
                if (
                  apiResponse.data?.updateStudysetSettings
                ) {
                  callback(true)
                } else {
                  if (apiResponse.errors) {
                    console.log(apiResponse.errors);
                  }
                  callback(false)
                }
              }).catch(function (error) {
                console.error(error);
                callback(false)
              })
            }).catch(function (error) {
              console.error(error);
              callback(false)
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
        align-items: stretch;
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
            align-items: center;
        }
    }
</style>
<Noscript />
<div class="grid page">
<div class="content">
<div>
    <a href={
      data.local ?
        "/studyset/local?id=" + data.localId :
        "/studysets/" + data.studysetId
    } class="button faint">
      <IconBackArrow /> Back
    </a>
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
        <h4>Studying Algorithm Settings</h4>
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
            var newReviewModeSettings = {
                goodAcc: 90,
                badAcc: 80
            }
            
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
                updateReviewModeSettings(newReviewModeSettings,
                    function(sucessfullyUpdated) {
                        if (sucessfullyUpdated) {
                            reviewModeChangesSaved = true;
                        } else {
                            alert("oops failed to save setttings?")
                        }
                    }
                )
            }
        }
        }}><IconCheckmark /> Save</button>
        </div>
    </div>
</div>
</div>
</div>
