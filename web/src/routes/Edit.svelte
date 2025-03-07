<script>
    import Noscript from "$lib/components/Noscript.svelte";
    import { onMount, mount } from "svelte";
    import { openIndexedDB } from "$lib/indexedDB";
    import { goto } from "$app/navigation";
    let { data } = $props();

    import IconLocal from "$lib/icons/Local.svelte";
    import IconCheckmark from "$lib/icons/Checkmark.svelte";
    import IconTrash from "$lib/icons/Trash.svelte";
    import IconMoreDotsHorizontal from "$lib/icons/MoreDotsHorizontal.svelte";
    import IconArrowUp from "$lib/icons/ArrowUp.svelte";
    import IconArrowDown from "$lib/icons/ArrowDown.svelte";
    import IconPlus from "$lib/icons/Plus.svelte";

    import { flip } from "svelte/animate";
    import { scale } from "svelte/transition";

    function resizeTextarea(event) {
        event.target.style.height = "auto";
        event.target.style.height = (event.target.scrollHeight + 10) + "px";
    }

    var terms = $state([]);
    var termId = 0;
    function addTerm(term, def) {
      terms.push({
        id: termId,
        term: term ?? "",
        def: def ?? ""
      })
      termId++;
    }
    function moveTerm(oldIndex, newIndex) {
      var term = terms[oldIndex];
      terms.splice(oldIndex, 1);
      terms.splice(newIndex, 0, term);
    }
    function deleteTerm(index) {
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

    onMount(function () {
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
      document.getElementById("create-button-local").addEventListener("click", function () {
        openIndexedDB(function (db) {
          var studysetsObjectStore = db.transaction("studysets", "readwrite").objectStore("studysets");
          var title = "Untitled Studyset";
          var newTitle = document.getElementById("edit-title").value;
          if (
            newTitle.length > 0 &&
            newTitle.length < 9000 &&
            /*
                use regex to make sure title is not just a bunch of spaces
                (if removing all spaces makes it equal to an empty string, it's all spaces)
                notice the exclamation mark for negation
            */
            !(newTitle.replace(/[\s\p{C}]+/gu, "") == "")
          ) {
              title = newTitle;
          }
          var dbAddReq = studysetsObjectStore.add({
            title: title,
            data: {
              terms: termsTo2DArray()
            },
            updated_at: (new Date()).toISOString()
          });
          dbAddReq.onsuccess = function (event) {
            /*
              "If the operation is successful,
              the value of the request's result property is the key
              for the new record" (https://developer.mozilla.org/en-US/docs/Web/API/IDBObjectStore/add)
            */
            goto("/studyset/local?id=" + dbAddReq.result)
          }
          dbAddReq.onerror = function (error) {
            console.error(error);
            alert("indexeddb error while trying to add studyset")
          }
        })
      })
      if (data.authed) {
      /* and data.new is true (creating a new studyset, not updating one) */
      var doubleReq = false;
      document.getElementById("create-button-authed").addEventListener("click", function () {
        if (doubleReq == false) {
          doubleReq = true;
          fetch("/api/v0/studysets", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              studyset: {
                title: document.getElementById("edit-title").value,
                private: document.getElementById("edit-private-true").classList.contains("selected"),
                data: {
                  terms: termsTo2DArray()
                }
              }
            })
          }).then(function (rawRes) {
            rawRes.json().then(function (result) {
              if (result.data && result.data.studyset) {
                goto("/studysets/" + result.data.studyset.id)
              } else if (result.error) {
                var errorModal = document.createElement("div");
                errorModal.classList.add("modal")
                errorModal.id = "create-error-modal"
                var errorModalContent = document.createElement("div");
                errorModalContent.classList.add("content");
              } else {
                alert("big error")
              }
            })
          }).catch(function (error) {
            alert("fetch error?");
            console.error(error);
          })
        }
      })
      }
    } else if (data.studysetId) {
    /* data.new is false (updating an existing studyset, not creating one) */
    if (data.authed) {
        fetch("/api/v0/studysets/" + data.studysetId, {
          method: "GET",
          credentials: "same-origin"
        }).then(function (rawResponse) {
          rawResponse.json().then(function (result) {
              if (result.error) {
              alert("error, could not load studyset while trying to edit")
            } else {
              document.getElementById("edit-title").value = result.data.studyset.title;
              addTermsFrom2DArray(result.data.studyset.data.terms);
              if (result.data.studyset.private) {
                document.getElementById("edit-private-false").classList.remove("selected");
                document.getElementById("edit-private-true").classList.add("selected");
              } else {
                document.getElementById("edit-private-false").classList.add("selected");
                document.getElementById("edit-private-true").classList.remove("selected");
              }
            }
          })
        })
        document.getElementById("save-button").addEventListener("click", function () {
          fetch("/api/v0/studysets/" + data.studysetId, {
            method: "PUT",
            credentials: "same-origin",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              studyset: {
                title: document.getElementById("edit-title").value,
                private: document.getElementById("edit-private-true").classList.contains("selected"),
                data: {
                  terms: termsTo2DArray()
                }
              }
            })
          }).then(function (rawResponse) {
            rawResponse.json().then(function (result) {
              if (result.error) {
                alert("error while trying to update studyset")
              } else {
                goto("/studysets/" + result.data.studyset.id)
              }
            })
          })
        })
      }
    }
    if (data.local && !data.new) {
      var studysetIDBRecord;
      openIndexedDB(function (db) {
        var studysetsObjectStore = db.transaction(["studysets"], "readonly").objectStore("studysets");
        var dbGetReq = studysetsObjectStore.get(data.localId);
        dbGetReq.onsuccess = function (event) {
          if (dbGetReq.result) {
            document.getElementById("edit-title").value = dbGetReq.result.title;
            if (dbGetReq.result.data && dbGetReq.result.data.terms) {
              addTermsFrom2DArray(dbGetReq.result.data.terms);
            }

            document.getElementById("save-button").addEventListener("click", function (_) {
              var title = "Untitled Studyset";
              var newTitle = document.getElementById("edit-title").value;
              if (
                newTitle.length > 0 &&
                newTitle.length < 9000 &&
                /*
                    use regex to make sure title is not just a bunch of spaces
                    (if removing all spaces makes it equal to an empty string, it's all spaces)
                    notice the exclamation mark for negation
                */
                !(newTitle.replace(/[\s\p{C}]+/gu, "") == "")
              ) {
                  title = newTitle;
              }
              var updatedStudyset = {
                id: data.localId,
                title: title,
                data: {
                  terms: termsTo2DArray()
                },
                updated_at: (new Date()).toISOString()
              }
              openIndexedDB(function (db) {
                var studysetsObjectStore = db.transaction(["studysets"], "readwrite").objectStore("studysets");
                var dbPutReq = studysetsObjectStore.put(updatedStudyset);
                dbPutReq.onsuccess = function (event) {
                  goto("/studyset/local?id=" + data.localId);
                }
                dbPutReq.onerror = function (error) {
                  console.error(error);
                  alert("indexeddb error while trying to update studyset")
                }
              })
            })
          } else {
            alert("couldn't load local studyset, mabye it doesn't exist?")
          }
        }
        dbGetReq.onerror = function (error) {
          console.error(error);
          alert("indexeddb error while trying to load local studyset")
        }
      })
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

  .term-row-box-term {
    grid-area: term;
    resize: none;
  }
  .term-row-box-def {
    grid-area: def;
    resize: none;
  }
  .term-row-box-actions {
    grid-area: actions;
  }

  @media only screen and (max-width: 800px) {
    .term-row-box {
      grid-template-rows: auto auto;
      grid-template-columns: 1fr auto;
      grid-template-areas:
        "term actions"
        "def actions";
    }
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
            <input id="edit-title" type="text" placeholder="Title" />
            {#if (data.authed && !data.local) }
            <div id="edit-private-div">
              <div class="combo-select">
                <button class="left selected" id="edit-private-false">
                  <IconCheckmark class="combo-selected-icon" />
                  Public
                </button>
                <button class="right" id="edit-private-true">
                  <IconCheckmark class="combo-selected-icon" />
                  Private
                </button>
              </div>
            </div>
            {/if}

            <div id="edit-terms-rows">
              {#each terms as term, index (term.id)}
              <div class="grid box term-row-box" animate:flip={{ duration: 400 }} in:scale={{ duration: 400 }} out:scale={{ duration: 400 }}>
                  <textarea
                      class="term-row-box-term"
                      rows="2"
                      placeholder="Term"
                      bind:value={term.term}
                      oninput={resizeTextarea}
                  ></textarea>
                  <textarea
                      class="term-row-box-def"
                      rows="2"
                      placeholder="Definition"
                      bind:value={term.def}
                      oninput={resizeTextarea}
                  ></textarea>
                  <div class="flex center term-row-box-actions">
                      <div class="dropdown">
                          <button class="dropdown-toggle" aria-label="Actions dropdown menu">
                              <IconMoreDotsHorizontal />
                          </button>
                          <div class="content">
                              <button onclick={function (event) {
                                moveTerm(index, index - 1);
                                event.target.blur();
                              }}>
                                  <IconArrowUp /> Move up
                              </button>
                              <button onclick={function (event) {
                                moveTerm(index, index + 1);
                                event.target.blur();
                              }}>
                                  <IconArrowDown /> Move down
                              </button>
                              <button class="ohno" onclick={function () { deleteTerm(index) }}>
                                  <IconTrash /> Delete
                              </button>
                          </div>
                      </div>
                  </div>
              </div>            
              {/each}
            </div>
            <div class="box">
              <div class="flex">
                <button onclick={function () { addTerm(); }}>
                  <IconPlus />
                  Add term
                </button>
                <button class="alt" onclick={function () { document.getElementById("import-terms-modal").classList.remove("hide"); }}>
                  <IconPlus />
                  Import Terms
                </button>
              </div>
            </div>
            {#if (data.new && data.authed) }
            <button id="create-button-authed">
              <IconCheckmark />
              Create
            </button>
            <div class="dropdown">
              <button class="dropdown-toggle" aria-label="saving options dropdown">
                <IconMoreDotsHorizontal />
              </button>
              <div class="content">
                <button id="create-button-local">
                  <IconLocal />
                  Save Locally
                </button>
              </div>
            </div>
            {:else if (data.new) }
            <button id="create-button-local">
              <IconCheckmark />
              Create
            </button>
            {:else}
            <button id="save-button">
              <IconCheckmark />
              Save Changes
            </button>
            {/if}

            <div class="modal hide" id="import-terms-modal">
              <div class="content">
                <div class="flex">
                  <button>Import</button>
                  <button class="alt" onclick={function () { document.getElementById("import-terms-modal").classList.add("hide")}}>Cancel</button>
                </div>
              </div>
            </div>
        </div>
      </div>
    </main>
