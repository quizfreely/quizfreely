<script>
    import Noscript from "$lib/components/Noscript.svelte";
    import { onMount } from "svelte";
    import idbApiLayer from "$lib/idb-api-layer/idb-api-layer.js";
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
    import IconPracticeTestChecklist from "$lib/icons/PracticeTestChecklist.svelte";
    import IconGraph from "$lib/icons/ChartGraphLine.svelte";
    import IconFlashcards from "$lib/icons/Flashcards.svelte";
    import IconSettingsGear from "$lib/icons/SettingsGear.svelte";

    var showDeleteConfirmationModal = $state(false);
    let title = $state(data?.studyset?.title);
    let terms = $state(data?.studyset?.terms);
    let flashcardsIndex = $state(0);

    function flashcardsFlip() {
        document.getElementById("flashcard").classList.toggle("flip");
    }
    function flashcardsPrev() {
        if (flashcardsIndex > 0) {
            flashcardsIndex -= 1
        }
    }
    function flashcardsNext() {
        if (flashcardsIndex < (terms.length - 1)) {
            flashcardsIndex += 1
        }
    }

    onMount(function () {
        if (data.local) {
            (async () => {
            const localStudyset = await idbApiLayer.getStudysetById(
                data.localId,
                {
                    terms: {
                        progress: true
                    }
                }
            );
            title = localStudyset?.title;
            terms = localStudyset?.terms;
            })();
        }

        function flashcardsOnKeyDown(e) {
            switch (e.key) {
                case "ArrowLeft":
                case "h":
                case "k":
                    flashcardsPrev();
                    break;
                case "ArrowRight":
                case "l":
                case "j":
                    flashcardsNext();
                    break;
                case " ": /* space */
                    /* prevent scrolling,
                    but don't flip here in keydown,
                    to avoid spam-flipping */
                    e.preventDefault();

                /* next/prev is in keydown to allow spamming to move quickly,
                flip is in keyup to prevent spam reflipping */
            }
        }
        function flashcardsOnKeyUp(e) {
            if (e.key == " ") {
                /* flip in keyup to only flip once */
                e.preventDefault();
                flashcardsFlip();
            }
        }

        window.addEventListener(
            "keydown", flashcardsOnKeyDown
        );
        window.addEventListener(
            "keyup", flashcardsOnKeyUp
        );

        /* return cleanup function to remove eventlisteners */
        return () => {
            window.removeEventListener(
                "keydown", flashcardsOnKeyDown
            );
            window.removeEventListener(
                "keyup", flashcardsOnKeyUp
            );
        }
    })
    async function deleteConfirmButtonClicked() {
        if (data.local) {
            await idbApiLayer.deleteStudyset(data.localId);
            goto("/dashboard");
        } else {
            fetch("/api/graphql", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "same-origin",
                body: JSON.stringify({
                    query: `mutation DeleteStudyset($id: ID!) {
    deleteStudyset(id: $id)
}`,
                    variables: {
                        id: data.studyset.id
                    }
                })
            }).then(
                response => response.json()
            ).then(response => {
                if (response.errors) {
                    console.error(response.errors);
                    alert("GraphQL error: " + response.errors[0].message);
                } else {
                    goto("/dashboard");
                }
            }).catch(error => {
                console.error(error);
                alert("Network error while deleting studyset");
            });
        }
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
</script>

<svelte:head>
    {#if title}
        <title>{title} - Quizfreely</title>
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
        <h2 class="caption" style="overflow-wrap:anywhere">{ title ?? "Title" }</h2>
        {#if data.local}
        <p class="fg0">
          <IconLocal /> Local Studyset
        </p>
        {:else if data?.studyset?.private}
        <p class="fg0">
          <IconEyeSlash /> Private Studyset
        </p>
        {:else if data?.studyset?.user?.displayName != null}
        <!--<p>
          Created by <a href="/users/{ data.studyset.user_id }">{ data.studyset.user_display_name }</a>
        </p>-->
        <p>
          Created by { data.studyset.user.displayName }
        </p>
        {/if}
        {#if (data.studyset && data.authed && (data.authedUser.id == data.studyset.user.id)) }
        <div id="edit-menu" class="flex">
          <a href="/studyset/edit/{ data.studyset.id }" class="button">
            <IconPencil />
            Edit
          </a>
          <div class="dropdown" tabindex="0">
            <button class="dropdown-toggle" aria-label="More Options Dropdown">
              <IconMoreDotsV />
            </button>
            <div class="content">
              <button class="ohno" id="delete-button" onclick={() => {showDeleteConfirmationModal = true}}><IconTrash /> Delete </button>
            </div>
          </div>
        </div>
        {:else if (data.local) }
        <div id="edit-menu" class="flex">
          <a href="/studyset/local/edit?id={ data.localId }" class="button">
            <IconPencil />
            Edit
          </a>
          <div class="dropdown" tabindex="0">
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
        <button id="flashcards-unmaximize" class="faint hide" onclick={unmaximizeFlashcards}>
          <IconBackArrow /> Back
        </button>
        <div>
          <div
            class="card double"
            id="flashcard"
            onclick={flashcardsFlip}
          >
            <div class="content">
              <div class="front" id="flashcard-front" style="white-space:pre-wrap">{ terms?.[flashcardsIndex]?.term ?? "term" }</div>
              <div class="back" id="flashcard-back" style="white-space:pre-wrap">{ terms?.[flashcardsIndex]?.def ?? "definition" }</div>
            </div>
          </div>
          <div class="caption">
            <div class="progress-bar thin yay" style="margin-left: 0.4rem; margin-right: 0.4rem;">
              <div style="width: {terms != null ?
                  ((flashcardsIndex + 1) / terms?.length) * 100 :
                  "20"
              }%"></div>
            </div>
          </div>
          <div class="caption centerThree">
            <p id="flashcards-count">
                {flashcardsIndex + 1}/{ terms?.length ?? "?" }
            </p>
            <div class="flex justifyselfcenter compact-gap">
              <button
                id="flashcards-prev-button"
                class="faint"
                aria-label="Previous Card"
                onclick={flashcardsPrev}
              >
              <IconArrowLeft />
              </button>
              <button id="flashcards-flip-button" class="faint" onclick={flashcardsFlip}>Flip</button>
              <button
                id="flashcards-next-button"
                class="faint"
                aria-label="Next Card"
                onclick={flashcardsNext}
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
          <button id="flashcards-maximize" class="alt" onclick={maximizeFlashcards}>
            <IconFlashcards />
            Flashcards
          </button>
          {#if data.local}
          <!-- <a href="/studyset/local/review-mode?id={ data.localId }" class="button alt"> -->
          <!--   <IconReviewModeBook /> -->
          <!--   Review Mode -->
          <!-- </a> -->
          <a href="/studyset/local/practice-test?id={data.localId}" class="button alt">
            <IconPracticeTestChecklist />
            Practice Test
          </a>
          <a href="/studyset/local/stats?id={data.localId}" class="button alt">
            <IconGraph />
            Progress &amp; Stats
          </a>
          {:else if data.studyset}
            <!-- <a href="/studysets/{ data.studyset.id }/review-mode" class="button alt"> -->
            <!--   <IconReviewModeBook /> -->
            <!--   Review Mode -->
            <!-- </a> -->
            <a href="/studysets/{data.studyset.id}/practice-test" class="button alt">
              <IconPracticeTestChecklist />
              Practice Test
            </a>
            <a href="/studysets/{data.studyset.id}/stats" class="button alt">
              <IconGraph />
              Progress &amp; Stats
            </a>
          {/if}
          
        </div>
        <!-- Add "this study set is private/public..." thingy here too -->
        <table class="outer caption box" id="terms-table">
          <tbody>
            <tr>
              <th>Term</th>
              <th>Definition</th>
            </tr>
            {#if terms != null}
                {#each terms as term }
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
