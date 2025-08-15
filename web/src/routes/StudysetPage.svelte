<script>
    import Noscript from "$lib/components/Noscript.svelte";
    import { onMount } from "svelte";
    import { openIndexedDB } from "$lib/indexedDB";
    import { goto } from "$app/navigation";
    import { fade } from "svelte/transition";
    let { data } = $props();

    import IconLocal from "$lib/icons/Local.svelte";
    import IconPencil from "$lib/icons/Pencil.svelte";
    import IconEyeSlash from "$lib/icons/EyeSlash.svelte";
    import IconTrash from "$lib/icons/Trash.svelte";
    import IconBackArrow from "$lib/icons/BackArrow.svelte";
    import IconArrowLeft from "$lib/icons/ArrowLeft.svelte";
    import IconArrowRight from "$lib/icons/ArrowRight.svelte";
    import IconMoreDotsV from "$lib/icons/MoreDotsVertical.svelte";
    import IconReviewModeBook from "$lib/icons/ReviewModeBook.svelte";
    import IconFlashcards from "$lib/icons/Flashcards.svelte";
    import IconSettingsGear from "$lib/icons/SettingsGear.svelte";

    var showDeleteConfirmationModal = $state(false);

    onMount(function () {
        if (data.local) {
        openIndexedDB(function (db) {
        /* load local studyset from indexeddb (this whole script tag is only there if `data.local` is true) */
        var studysetsObjectStore = db.transaction(["studysets"]).objectStore("studysets");
        var dbGetReq = studysetsObjectStore.get(data.localId);
        dbGetReq.onerror = function (event) {
          alert("oopsie woopsie, indexeddb error");
        }
        dbGetReq.onsuccess = function (event) {
          if (dbGetReq.result) {
            if (dbGetReq.result.title) {
              document.getElementById("studyset-title").innerText = dbGetReq.result.title;
            }
            if (dbGetReq.result.data && dbGetReq.result.data.terms) {
              var termsTable = document.getElementById("terms-table");
              for (var i = 0; i < dbGetReq.result.data.terms.length; i++) {
                var newRow = termsTable.insertRow();
                var newCell0 = newRow.insertCell();
                var newCell1 = newRow.insertCell();
                newCell0.innerText = dbGetReq.result.data.terms[i][0];
                newCell0.style.whiteSpace = "pre-wrap";
                newCell1.innerText = dbGetReq.result.data.terms[i][1];
                newCell1.style.whiteSpace = "pre-wrap";
              }
              flashcardsChange();
            }
          } else {
            alert("studyset not found :(")
          }
        }
      })
        }

        var flashcardsIndex = 0;
      function flashcardsFlip() {
        document.getElementById("flashcard").classList.toggle("flip");
      }
      document.getElementById("flashcard").addEventListener("click", flashcardsFlip);
      document.getElementById("flashcards-flip-button").addEventListener("click", flashcardsFlip);
      
      function flashcardsChange() {
        var termsList = document.getElementById("terms-table").children[0];
        document.getElementById("flashcard-front").innerHTML = termsList.children[flashcardsIndex + 1].children[0].innerHTML
        document.getElementById("flashcard-back").innerHTML = termsList.children[flashcardsIndex + 1].children[1].innerHTML
        document.getElementById("flashcards-count").innerText = (flashcardsIndex + 1) + "/" + (termsList.children.length - 1);
      }

      function flashcardsNext() {
        if (flashcardsIndex < (document.getElementById("terms-table").children[0].children.length - 2)) {
          flashcardsIndex += 1
          flashcardsChange()
        }
      }
      document.getElementById("flashcards-next-button").addEventListener("click", flashcardsNext);

      function flashcardsPrev() {
        if (flashcardsIndex > 0) {
          flashcardsIndex -= 1
          flashcardsChange()
        }
      }
      document.getElementById("flashcards-prev-button").addEventListener("click", flashcardsPrev);

      /* the modal's html is the same for local and authed */
      if (document.getElementById("delete-button")) {
        document.getElementById("delete-button").addEventListener("click", function () {
          showDeleteConfirmationModal = true
        })
      }
      function maximizeFlashcards() {
        document.getElementById("title-and-menu-outer-div").classList.add("hide");
        document.getElementById("terms-and-stuff-outer-div").classList.add("hide");
        document.getElementById("footer-wave").classList.add("hide");
        document.getElementById("footer").classList.add("hide");

        document.getElementById("flashcards-unmaximize").classList.remove("hide");
      }
      function unmaximizeFlashcards() {
        document.getElementById("title-and-menu-outer-div").classList.remove("hide");
        document.getElementById("terms-and-stuff-outer-div").classList.remove("hide");
        document.getElementById("footer-wave").classList.remove("hide");
        document.getElementById("footer").classList.remove("hide");

        document.getElementById("flashcards-unmaximize").classList.add("hide");
      }
      document.getElementById("flashcards-maximize").addEventListener("click", maximizeFlashcards);
      document.getElementById("flashcards-unmaximize").addEventListener("click", unmaximizeFlashcards);
    })
    function deleteConfirmButtonClicked() {
      if (data.local) {
        openIndexedDB(function (db) {
          var studysetsObjectStore = db.transaction(["studysets"], "readwrite").objectStore("studysets");
          var dbDeleteReq = studysetsObjectStore.delete(data.localId);
          dbDeleteReq.onsuccess = function (event) {
            goto("/dashboard");
          }
          dbDeleteReq.onerror = function (error) {
            console.error(error);
            alert("indexeddb error while trying to delete local studyset")
          }
        })
      } else {
        fetch("/api/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
          body: JSON.stringify({
            query: `
              mutation DeleteStudyset($id: ID!) {
                deleteStudyset(id: $id)
              }
            `,
            variables: {
              id: data.studyset.id
            }
          })
        })
        .then(response => response.json())
        .then(response => {
          if (response.errors) {
            console.error(response.errors);
            alert("GraphQL error: " + response.errors[0].message);
          } else {
            goto("/dashboard");
          }
        })
        .catch(error => {
          console.error(error);
          alert("Network error while deleting studyset");
        });
      }
    }
</script>

<svelte:head>
    {#if data.studyset}
    <title>{ data.studyset.title } - Quizfreely</title>
    {:else}
    <title>Quizfreely</title>
    {/if}
</svelte:head>

{#if data.local}
<Noscript />
{/if}
<main>
  <div class="grid page">
    <div class="content">
      <div id="title-and-menu-outer-div">
        {#if (data?.studyset?.title) }
        <h2 class="caption" style="overflow-wrap:anywhere">{ data.studyset.title }</h2>
        {:else}
        <h2 id="studyset-title" class="caption" style="overflow-wrap:anywhere">Title</h2>
        {/if}
        {#if data.local}
        <p class="fg0">
          <IconLocal /> Local Studyset
        </p>
        {:else if data?.studyset?.private}
        <p class="fg0">
          <IconEyeSlash /> Private Studyset
        </p>
        {:else if data?.studyset?.user?.display_name != null}
        <!--<p>
          Created by <a href="/users/{ data.studyset.user_id }">{ data.studyset.user_display_name }</a>
        </p>-->
        <p>
          Created by { data.studyset.user.display_name }
        </p>
        {/if}
        {#if (data.studyset && data.authed && (data.authedUser.id == data.studyset.user.id)) }
        <div id="edit-menu" class="flex">
          <a href="/studyset/edit/{ data.studyset.id }" class="button">
            <IconPencil />
            Edit
          </a>
          <div class="dropdown">
            <button class="dropdown-toggle" aria-label="More Options Dropdown">
              <IconMoreDotsV />
            </button>
            <div class="content">
              <button class="ohno" id="delete-button"><IconTrash /> Delete </button>
            </div>
          </div>
        </div>
        {:else if (data.local) }
        <div id="edit-menu" class="flex">
          <a href="/studyset/local/edit?id={ data.localId }" class="button">
            <IconPencil />
            Edit
          </a>
          <div class="dropdown">
            <button class="dropdown-toggle" aria-label="More Options Dropdown">
              <IconMoreDotsV />
            </button>
            <div class="content">
              <button class="ohno" id="delete-button"><IconTrash /> Delete </button>
            </div>
          </div>
        </div>
        {/if}
      </div>
      <div id="flashcards-outer-div">
        <button id="flashcards-unmaximize" class="faint hide">
          <IconBackArrow /> Back
        </button>
        <div>
          <div
            class="card double"
            id="flashcard"
          >
            {#if (data.studyset?.terms != null && data.studyset.terms.length > 0) }
            <div class="content">
              <div class="front" id="flashcard-front" style="white-space:pre-wrap">{ data.studyset.terms[0].term }</div>
              <div class="back" id="flashcard-back" style="white-space:pre-wrap">{ data.studyset.terms[0].def }</div>
            </div>
            {:else}
            <div class="content">
              <div class="front" id="flashcard-front" style="white-space:pre-wrap">
                ...
              </div>
              <div class="back" id="flashcard-back" style="white-space:pre-wrap">
                ...
              </div>
            </div>
            {/if}
          </div>
          <div class="caption centerThree">
            {#if (data.studyset?.terms != null) }
            <p id="flashcards-count">
              1/{ data.studyset.terms.length }
            </p>
            {:else}
            <p id="flashcards-count">
              ...
            </p>
            {/if}
            <div class="flex justifyselfcenter">
              <button
                id="flashcards-prev-button"
                aria-label="Previous Card"
              >
              <IconArrowLeft />
              </button>
              <button id="flashcards-flip-button">Flip</button>
              <button
                id="flashcards-next-button"
                aria-label="Next Card"
              >
              <IconArrowRight />
              </button>
            </div>
            <div class="flex end">
              <!--<button id="flashcards-maximize-button">
                <i class="nf nf-md-fullscreen"></i>
              </button>
              <button id="flashcards-unmaximize-button" class="hide">
                <i class="nf nf-md-fullscreen_exit"></i>
              </button>-->
            </div>
          </div>
        </div>
      </div>
      <div id="terms-and-stuff-outer-div">
        <div class="caption grid list">
          <button id="flashcards-maximize" class="alt">
            <IconFlashcards />
            Flashcards
          </button>
          {#if (data.local) }
          <a href="/studyset/local/review-mode?id={ data.localId }" class="button alt">
            <IconReviewModeBook />
            Review Mode
          </a>
          <!--<a href="/studyset/local/quiz?id=<eta>= data.localId </eta>" class="button alt">
            <IconCheckXMark />
            Practice Test
          </a>-->
          {:else if (data.studyset) }
            <a href="/studysets/{ data.studyset.id }/review-mode" class="button alt">
              <IconReviewModeBook />
              Review Mode
            </a>
            <!--<a href="/studysets/<eta>= data.studyset.id </eta>/test" class="button alt">
              <IconCheckXMark />
              Practice Test
            </a>-->
          {/if}
          
        </div>
        <!-- Add "this study set is private/public..." thingy here too -->
        <table class="outer caption box" id="terms-table">
          <tbody>
            <tr>
              <th>Term</th>
              <th>Definition</th>
            </tr>
            {#if (data.studyset?.terms != null) }
                {#each data.studyset.terms as term }
                    <tr>
                      <td style="white-space:pre-wrap">{ term.term }</td>
                      <td style="white-space:pre-wrap">{ term.def }</td>
                    </tr>
                {/each}
            {/if}
          </tbody>
        </table>
      </div>
      {#if showDeleteConfirmationModal }
      <div class="modal" transition:fade={{ duration: 200 }}>
        <div class="content">
          <p>Are you sure you want to delete this studyset?</p>
          <div class="flex">
            <button class="ohno" onclick={deleteConfirmButtonClicked}>
              <IconTrash />
              Delete
            </button>
            <button class="alt" onclick={function () { showDeleteConfirmationModal = false }}>Cancel</button>
          </div>
        </div>
      </div>
      {/if}
    </div>
  </div>
</main>
