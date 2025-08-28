<script>
    import Noscript from "$lib/components/Noscript.svelte";
    import { onMount, mount } from "svelte";
    import idbApiLayer from "$lib/idb-api-layer/idb-api-layer.js";
    import { goto, beforeNavigate } from "$app/navigation";
    import { cancelNprogressTimeout } from "$lib/stores/nprogressTimeout.js";
    let { data } = $props();

    import IconLocal from "$lib/icons/Local.svelte";
    import IconCheckmark from "$lib/icons/Checkmark.svelte";
    import IconTrash from "$lib/icons/Trash.svelte";
    import IconArrowLeft from "$lib/icons/ArrowLeft.svelte"
    import IconMoreDotsV from "$lib/icons/MoreDotsVertical.svelte";
    import IconArrowUp from "$lib/icons/ArrowUp.svelte";
    import IconArrowDown from "$lib/icons/ArrowDown.svelte";
    import IconPlus from "$lib/icons/Plus.svelte";

    import { flip } from "svelte/animate";
    import { scale, fade } from "svelte/transition";

    import AutoResizeTextarea from "$lib/components/AutoResizeTextarea.svelte";

    var showImportTermsModal = $state(false);
    var showExitConfirmationModal = $state(false);

    var unsavedChanges = false;
    var bypassUnsavedChangesConfirmation = false;

    var terms = $state([]);
    var existingTermIdsToDelete = [];
    var key = 0;
    function addTerm(term, def, id) {
      terms.push({
        id: id ?? undefined,
        term: term ?? "",
        def: def ?? "",
        key: key,
      })
      key++;
    }
    function moveTerm(oldIndex, newIndex) {
      if (
        oldIndex >= 0 && oldIndex < terms.length &&
        newIndex >= 0 && newIndex < terms.length
      ) {
        var term = terms[oldIndex];
        terms.splice(oldIndex, 1);
        terms.splice(newIndex, 0, term);
      }
    }
    function deleteTerm(index) {
      if (terms[index].id != null) {
        existingTermIdsToDelete.push(
          terms[index].id
        );
      }
      terms.splice(index, 1);
    }

    function termsTo2DArray() {
      var arr = [];
      for (var index = 0; index < terms.length; index++) {
        arr.push([terms[index].term, terms[index].def]);
      }
      return arr;
    }
    function addTermsFrom2DArray(arr) {
      for (var row = 0; row < arr.length; row++) {
        addTerm(arr[row][0], arr[row][1]);
      }
    }

    onMount(async function () {
        if (data.authed && !(data.local)) {
            document.getElementById("edit-private-false").addEventListener("click",
                function () {
                    document.getElementById("edit-private-false").classList.add("selected");
                    document.getElementById("edit-private-true").classList.remove("selected");
                }
            )
            document.getElementById("edit-private-true").addEventListener("click",
                function () {
                    document.getElementById("edit-private-false").classList.remove("selected");
                    document.getElementById("edit-private-true").classList.add("selected");
                }
            )
        }
        if (data.new) {
            addTerm();
            if (data.authed) {
            /* and data.new is true (creating a new studyset, not updating one) */
            }
        } else if (data.studysetId) {
            /* data.new is false (updating an existing studyset, not creating one) */
            if (data.authed) {
                fetch("/api/graphql", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    credentials: "same-origin",
                    body: JSON.stringify({
                        query: `
                            query GetStudyset($id: ID!) {
                                studyset(id: $id) {
                                    title
                                    private
                                    terms {
                                        id
                                        term
                                        def
                                    }
                                }
                            }
                        `,
                        variables: {
                            id: data.studysetId
                        }
                    })
                }).then(response => response.json()).then(result => {
                    if (result.errors) {
                        alert("Error loading studyset");
                        console.error(result.errors);
                    } else {
                        const studyset = result.data.studyset;
                        document.getElementById("edit-title").value = studyset.title;
                        if (studyset.private) {
                            document.getElementById("edit-private-false").classList.remove("selected");
                            document.getElementById("edit-private-true").classList.add("selected");
                        } else {
                            document.getElementById("edit-private-false").classList.add("selected");
                            document.getElementById("edit-private-true").classList.remove("selected");
                        }
                        if (studyset.terms != null) {
                            studyset.terms.forEach((t) => {
                                addTerm(
                                    t.term,
                                    t.def,
                                    t.id
                                );
                            })
                        }
                    }
                });
            }
        }
        if (data.local && !data.new) {
            const studysetRecord = await idbApiLayer.getStudysetById(
                data.localId,
                { terms: true }
            );
            if (studysetRecord) {
                document.getElementById("edit-title").value = studysetRecord.title;
                if (studysetRecord.terms != null) {
                    studysetRecord.terms.forEach((t) => {
                        addTerm(
                            t.term,
                            t.def,
                            t.id
                        );
                    })
                }
            }
        }
    });

    var updateLocalStudysetCooldown = false;
    function updateLocalStudyset() {
        if (updateCloudStudysetCooldown) {
            return;
        }

        updateLocalStudysetCooldown = true;
        setTimeout(function () { updateLocalStudysetCooldown = false}, 2000);

        let existingTerms = [];
        let newTerms = [];
        for (let index = 0; index < terms.length; index++) {
            if (terms[index].id != null) {
                existingTerms.push({
                    id: terms[index].id,
                    term: terms[index].term,
                    def: terms[index].def,
                    sortOrder: index
                });
            } else {
                newTerms.push({
                    term: terms[index].term,
                    def: terms[index].def,
                    sortOrder: index
                });
            }
        }

        (async () => {
            await idbApiLayer.updateStudyset(
                {
                    id: data.localId,
                    title: document.getElementById("edit-title").value,
                },
                existingTerms,
                newTerms,
                existingTermIdsToDelete
            );
            goto("/studyset/local?id=" + data.localId);
        })();
    }

    var createLocalStudysetCooldown = false;
    function createLocalStudyset() {
        if (createCloudStudysetCooldown) {
            return;
        }

        createLocalStudysetCooldown = true;
        setTimeout(function () { createLocalStudysetCooldown = false}, 2000);

        let newTerms = [];
        for (let index = 0; index < terms.length; index++) {
            newTerms.push({
                term: terms[index].term,
                def: terms[index].def,
                sortOrder: index
            });
        }

        (async () => {
            const newId = await idbApiLayer.createStudyset(
                {
                    title: document.getElementById("edit-title").value
                },
                newTerms
            )
            goto("/studyset/local?id=" + newId);
        })();
    }
    var updateCloudStudysetCooldown = false;
    function updateCloudStudyset() {
        if (updateCloudStudysetCooldown) {
            return;
        }
        
        updateCloudStudysetCooldown = true;
        setTimeout(function () { updateCloudStudysetCooldown = false}, 2000);

        let existingTerms = [];
        let newTerms = [];
        for (let index = 0; index < terms.length; index++) {
            if (terms[index].id != null) {
                existingTerms.push({
                    id: terms[index].id,
                    term: terms[index].term,
                    def: terms[index].def,
                    sortOrder: index
                });
            } else {
                newTerms.push({
                    term: terms[index].term,
                    def: terms[index].def,
                    sortOrder: index
                });
            }
        }

        fetch("/api/graphql", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            credentials: "same-origin",
            body: JSON.stringify({
                query: `mutation UpdateStudyset($id: ID!, $studyset: StudysetInput, $terms: [TermInput], $newTerms: [NewTermInput], $deleteTerms: [ID]) {
    updateStudyset(
        id: $id,
        studyset: $studyset,
            terms: $terms,
            newTerms: $newTerms,
            deleteTerms: $deleteTerms
    ) {
        id
    }
}`,
                variables: {
                    id: data.studysetId,
                    studyset: {
                        title: document.getElementById("edit-title").value,
                        private: document.getElementById("edit-private-true").classList.contains("selected"),
                    },
                    terms: existingTerms,
                    newTerms: newTerms,
                    deleteTerms: existingTermIdsToDelete
                }
            })
        }).then(response => response.json()).then(result => {
            if (result.errors) {
                console.log(result);
                alert("Error updating studyset");
            } else if (result.data?.updateStudyset) {
                goto("/studysets/" + result.data.updateStudyset.id);
            }
        });
    }
    var createCloudStudysetCooldown = false;
    function createCloudStudyset() {
        if (createCloudStudysetCooldown) {
            return;
        }
        
        createCloudStudysetCooldown = true;
        setTimeout(function () { createCloudStudysetCooldown = false}, 2000);
        const title = document.getElementById("edit-title").value;
        const isPrivate = document.getElementById("edit-private-true").classList.contains("selected");
        let newTerms = [];
        for (let index = 0; index < terms.length; index++) {
            newTerms.push({
                term: terms[index].term,
                def: terms[index].def,
                sortOrder: index
            });
        }
        const query = `
            mutation CreateStudyset($studyset: StudysetInput!, $terms: [NewTermInput]) {
                createStudyset(studyset: $studyset, terms: $terms) {
                    id
                }
            }
        `;
        
        const variables = {
            studyset: {
                title,
                private: isPrivate,
            },
            terms: newTerms
        };
        
        fetch("/api/graphql", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                query,
                variables
            })
        })
        .then(response => response.json())
        .then(result => {
            if (result.errors) {
                alert("Error creating studyset");
                console.error(result.errors);
            } else if (result.data?.createStudyset) {
                goto("/studysets/" + result.data.createStudyset.id);
            } else {
                alert("Unexpected response when creating studyset");
            }
        })
        .catch(error => {
            alert("Network error");
            console.error(error);
        });
    }
    function saveButtonOrCreateButton() {
      bypassUnsavedChangesConfirmation = true;
      if (data.new) {
        if (data.authed) {
          createCloudStudyset();
        } else {
          createLocalStudyset();
        }
      } else {
        if (data.local) {
          updateLocalStudyset();
        } else {
          updateCloudStudyset();
        }
      }
    }

    let importTermsTermDefDelimiterRadioSelect = $state("tab");
    let importTermsRowDelimiterRadioSelect = $state("newline");

    beforeNavigate(function (navigation) {
        if (unsavedChanges && !bypassUnsavedChangesConfirmation) {
            if (navigation.type !== "leave") {
                /* when navigation.type is NOT "leave",
                it's controlled by SvelteKit, so we can
                show our js confirmation modal */
                showExitConfirmationModal = true;
            }
            /* our routes/+layout.svelte shows a progress bar
            if navigation takes too long, so we cancel the timer
            when we cancel navigation, so that it doesn't show */
            cancelNprogressTimeout();

            /* run it again a little delayed to make sure it cancels the timeout after layout actually finishes creating the timeout */
            setTimeout(cancelNprogressTimeout, 50);

            /* if navigation.type is "leave",
            then its controlled by the browser &
            the browser shows it's own native modal
            when we use `.cancel()` */
            navigation.cancel();

        }
    })
</script>
<svelte:head>
    <title>Quizfreely</title>
</svelte:head>

<style>

  .term-row-box {
    gap: 1rem;
    grid-template-rows: auto;
    grid-template-columns: 1fr 1fr auto;
    grid-template-areas: "term def actions";
  }

  .term-row-box > :global(.term-row-box-term) {
    grid-area: term;
    resize: none;
  }
  .term-row-box > :global(.term-row-box-def) {
    grid-area: def;
    resize: none;
  }
  .term-row-box-actions {
    grid-area: actions;
  }

  .flexcolonmobile {
    flex-direction: row;
    align-content: center;
  }
  @media only screen and (max-width: 800px) {
    .flexcolonmobile {
      flex-direction: column;
      align-content: start;
    }

    .term-row-box {
      grid-template-rows: auto auto;
      grid-template-columns: 1fr auto;
      grid-template-areas:
        "term actions"
        "def actions";
    }
  }

  .import-terms-split {
    display: grid;
    gap: 1rem;
    grid-template-rows: auto;
    grid-template-columns: 1fr 1fr;
  }
  #import-terms-paste-textarea {
    width: 100%;
  }

  .slightly-smaller-textbox {
    width: 10rem;
  }
</style>

    <Noscript />
    <main>
      <div class="grid page" style="min-height: 80vh;">
        <div class="content">
            <div id="mainEditStudySetIsCopy" class="modal hide">
              <div class="content">
                <h2>¯\_(ツ)_/¯</h2>
                <p>
                  A study set with this name already exists in your account.
                  <br />
                  You can update/overwrite the existing copy or go back and
                  rename this copy.
                </p>
                <div class="flex">
                  <button id="mainEditStudySetIsCopyUpdate">
                    Update existing
                  </button>
                  <button id="mainEditStudySetIsCopyBack">Go back</button>
                </div>
              </div>
            </div>
            <div>
              <a class="button faint" data-sveltekit-preload-data="false" href={ 
                data.new ?
                  "/dashboard" :
                  (data.local ?
                    "/studyset/local?id=" + data.localId :
                    "/studysets/" + data.studysetId
                  )
              }>
                <IconArrowLeft />
                Back
              </a>
            </div>
            <input id="edit-title" type="text" placeholder="Title" />
            {#if (data.authed && !data.local) }
            <div id="edit-private-div">
              <div class="combo-select">
                <button class="left selected" id="edit-private-false" onclick={() => unsavedChanges = true}>
                  <IconCheckmark class="combo-selected-icon" />
                  Public
                </button>
                <button class="right" id="edit-private-true" onclick={() => unsavedChanges = true}>
                  <IconCheckmark class="combo-selected-icon" />
                  Private
                </button>
              </div>
            </div>
            {/if}

            <div id="edit-terms-rows">
              {#each terms as term, index (term.key)}
              <div class="grid box term-row-box" animate:flip={{ duration: 400 }} in:scale={{ duration: 400 }} out:scale={{ duration: 400 }}>
                  <AutoResizeTextarea
                    div={{
                      class: "term-row-box-term"
                    }}
                    textarea={{
                      placeholder: "Term",
                      rows: "2",
                      oninput: () => {if (!unsavedChanges) {
                        unsavedChanges = true;
                      }}
                    }}
                    bind:value={term.term}
                  />
                  <AutoResizeTextarea
                    div={{
                      class: "term-row-box-def"
                    }}
                    textarea={{
                      placeholder: "Definition",
                      rows: "2",
                      oninput: () => {if (!unsavedChanges) {
                        unsavedChanges = true;
                      }}
                    }}
                    bind:value={term.def}
                  />
                  <div class="flex center term-row-box-actions">
                      <div class="dropdown left" tabindex="0">
                          <button class="dropdown-toggle" aria-label="Actions dropdown menu">
                              <IconMoreDotsV />
                          </button>
                          <div class="content">
                              <button onclick={function (event) {
                                moveTerm(index, index - 1);
                                unsavedChanges = true;
                                event.target.blur();
                              }}>
                                  <IconArrowUp /> Move up
                              </button>
                              <button onclick={function (event) {
                                moveTerm(index, index + 1);
                                unsavedChanges = true;
                                event.target.blur();
                              }}>
                                  <IconArrowDown /> Move down
                              </button>
                              <button class="ohno" onclick={function () {
                                  deleteTerm(index);
                                  unsavedChanges = true;
                              }}>
                                  <IconTrash /> Delete
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
              {:else}
              <div class="box">
                <p class="fg0">No terms?<br>Tap "add term" to create one or use "import terms" to transfer them from somewhere else.</p>
              </div>
              {/each}
            </div>
            <div class="box">
              <div class="flex">
                <button onclick={function () {
                  addTerm();
                  unsavedChanges = true;
                }}>
                  <IconPlus />
                  Add term
                </button>
                <button class="alt" onclick={function () { showImportTermsModal = true }}>
                  <IconPlus />
                  Import terms
                </button>
              </div>
            </div>
            <div class="flex" style="align-items:center;">
              <button data-sveltekit-preload-data="false" onclick={saveButtonOrCreateButton}>
                <IconCheckmark />
                {#if data.new}
                Create
                {:else}
                Save
                {/if}
              </button>
              <a class="button alt" data-sveltekit-preload-data="false" href={ 
                data.new ?
                  "/dashboard" :
                  (data.local ?
                    "/studyset/local?id=" + data.localId :
                    "/studysets/" + data.studysetId
                  )
              }>
                Cancel
              </a>
              {#if data.new && data.authed}
              <div class="dropdown" tabindex="0">
                <button class="dropdown-toggle" aria-label="saving options dropdown">
                  <IconMoreDotsV />
                </button>
                <div class="content">
                  <button data-sveltekit-preload-data="false" onclick={() => {
                    bypassUnsavedChangesConfirmation = true;
                    createLocalStudyset()
                  }}>
                    <IconLocal />
                    Save Locally
                  </button>
                </div>
              </div>
              {/if}
            </div>
            {#if showImportTermsModal}
            <div class="modal" transition:fade={{ duration: 200 }}>
              <div class="content">
                <div class="grid import-terms-split">
                  <div>
                    <p>Between term & definition</p>
                    <div class="flex compact-gap nowrap" style="flex-direction: column; align-items: start; align-content: start;">
                        <div class="flex compact-gap nowrap" style="flex-direction: column; align-content: start;">
                            <button class="button-box {
                                importTermsTermDefDelimiterRadioSelect == "tab" ?
                                    "selected" : ""
                            }" onclick={() => importTermsTermDefDelimiterRadioSelect = "tab"}>
                                <IconCheckmark class="button-box-selected-icon"></IconCheckmark>
                                Tab
                            </button>
                            <button class="button-box {
                                importTermsTermDefDelimiterRadioSelect == "comma" ?
                                    "selected" : ""
                            }" onclick={() => importTermsTermDefDelimiterRadioSelect = "comma"}>
                                <IconCheckmark class="button-box-selected-icon"></IconCheckmark>
                                Comma <code>,</code>
                            </button>
                            <button class="button-box {
                                importTermsTermDefDelimiterRadioSelect == "custom" ?
                                    "selected" : ""
                            }" onclick={() => importTermsTermDefDelimiterRadioSelect = "custom"}>
                                <IconCheckmark class="button-box-selected-icon"></IconCheckmark>
                                Custom
                            </button>
                        </div>
                    </div>
                    {#if importTermsTermDefDelimiterRadioSelect == "custom"}
                    <input type="text" placeholder="Term Delimiter" id="import-terms-custom-termdef-delimiter-input" class="slightly-smaller-textbox" transition:scale={{duration:400}}>
                    {/if}
                  </div>
                  <div>
                    <p>Between rows</p>
                    <div class="flex compact-gap nowrap" style="flex-direction: column; align-items: start; align-content: start;">
                        <div class="flex compact-gap nowrap" style="flex-direction: column; align-content: start;">
                            <button class="button-box {
                                importTermsRowDelimiterRadioSelect == "newline" ?
                                    "selected" : ""
                            }" onclick={() => importTermsRowDelimiterRadioSelect = "newline"}>
                                <IconCheckmark class="button-box-selected-icon"></IconCheckmark>
                                New line
                            </button>
                            <button class="button-box {
                                importTermsRowDelimiterRadioSelect == "semicolon" ?
                                    "selected" : ""
                            }" onclick={() => importTermsRowDelimiterRadioSelect = "semicolon"}>
                                <IconCheckmark class="button-box-selected-icon"></IconCheckmark>
                                Semicolon <code>;</code>
                            </button>
                            <button class="button-box {
                                importTermsRowDelimiterRadioSelect == "custom" ?
                                    "selected" : ""
                            }" onclick={() => importTermsRowDelimiterRadioSelect = "custom"}>
                                <IconCheckmark class="button-box-selected-icon"></IconCheckmark>
                                Custom
                            </button>
                        </div>
                    </div>
                    {#if importTermsRowDelimiterRadioSelect == "custom"}
                    <input type="text" placeholder="Row Delimiter" id="import-terms-custom-row-delimiter-input" class="slightly-smaller-textbox" transition:scale={{duration:400}}>
                    {/if}
                  </div>
                </div>
                <textarea id="import-terms-paste-textarea" class="vertical" rows="3" placeholder="Paste data here, then press the import button"></textarea>
                <div class="flex">
                  <button onclick={
                    function () {
                      var termDefDelimiter;
                      var rowDelimiter;
                      if (importTermsTermDefDelimiterRadioSelect == "tab") {
                        termDefDelimiter = "\t";
                      } else if (importTermsTermDefDelimiterRadioSelect == "comma") {
                        termDefDelimiter = ","
                      } else if (importTermsTermDefDelimiterRadioSelect == "custom") {
                        termDefDelimiter = document.getElementById("import-terms-custom-termdef-delimiter-input").value;
                        if (termDefDelimiter == "") {
                          alert("Custom delimiter can't be blank >:(");
                          return;
                        }
                      }
                      if (importTermsRowDelimiterRadioSelect == "newline") {
                        rowDelimiter = "\n";
                      } else if (importTermsRowDelimiterRadioSelect == "semicolon") {
                        rowDelimiter = ";"
                      } else if (importTermsRowDelimiterRadioSelect == "custom") {
                        rowDelimiter = document.getElementById("import-terms-custom-row-delimiter-input").value;
                        if (rowDelimiter == "") {
                          alert("Custom delimiter can't be blank >:(");
                          return;
                        }
                      }

                      /* we add a blank term when users create a studyset,
                      so if a user imports terms without changing that blank term
                      we probably don't want them to have a blank term right before their imported terms
                      
                      so we check if there's only one, blank, term, and delete it if so before importing terms */
                      if (terms.length === 1 && terms[0].term === "" && terms[0].def === "") {
                        terms.splice(0, 1);
                      }

                      var pastedData = document.getElementById("import-terms-paste-textarea").value
                      addTermsFrom2DArray(
                        pastedData.split(rowDelimiter).map(row => row ? row.split(termDefDelimiter) : ["",""])
                      );

                      /* after importing, if there was a delimiter at the end, it will create a blank last term,
                      check the last term and remove it if it's blank */
                      if (terms[terms.length - 1].term === "" && terms[terms.length - 1].def === "") {
                        terms.splice(terms.length - 1, 1);
                      }

                      unsavedChanges = true;

                      /* hide the modal after importing */
                      showImportTermsModal = false;
                    }
                  }>Import</button>
                  <button class="alt" onclick={function () { showImportTermsModal = false }}>Cancel</button>
                </div>
              </div>
            </div>
            {/if}
            {#if showExitConfirmationModal}
            <div class="modal" transition:fade={{ duration: 200 }}>
              <div class="content">
                <h4>Save changes?</h4>
                <div class="flex flexcolonmobile">
                  <button data-sveltekit-preload-data="false" onclick={saveButtonOrCreateButton} class="yay alt">
                    <IconCheckmark />
                    Save
                  </button>
                  <button class="alt" onclick={function () { showExitConfirmationModal = false; }}>Keep Editing</button>
                  <button class="button ohno alt" data-sveltekit-preload-data="false" onclick={function () {
                    bypassUnsavedChangesConfirmation = true;
                    goto(data.new ?
                      "/dashboard" :
                      (data.local ?
                        "/studyset/local?id=" + data.localId :
                        "/studysets/" + data.studysetId
                      )
                    );
                  }}>
                    <IconTrash />
                    Discard Changes
                  </button>
                </div>
              </div>
            </div>
            {/if}
        </div>
      </div>
    </main>
