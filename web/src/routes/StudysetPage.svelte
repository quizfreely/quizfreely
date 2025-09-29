<script>
    import Noscript from "$lib/components/Noscript.svelte";
    import { onMount } from "svelte";
    import idbApiLayer from "$lib/idb-api-layer/idb-api-layer.js";
    import { goto, beforeNavigate } from "$app/navigation";
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
    import GroupIcon from "$lib/icons/GroupUsers.svelte";
    import { Confetti } from "svelte-confetti";
    import { footerState } from "$lib/components/footer.svelte.js";

    var showDeleteConfirmationModal = $state(false);
    let title = $state(data?.studyset?.title);
    let terms = $state(data?.studyset?.terms);
    let flashcardsIndex = $state(0);

    /* use a set to track seen flashcards
    so flipping same card does not add a new element
    so we can use the length/size to check how many cards have been seen (both sides) this session */
    let flashcardsSeenWhileMax = $state(new Set());
    let showConfetti = $state(false)

    function flashcardsFlip() {
        document.getElementById("flashcard").classList.toggle("flip");
        if (flashcardsMaximized) {
            flashcardsSeenWhileMax.add(flashcardsIndex);
        }
    }
    function flashcardsPrev() {
        if (flashcardsIndex > 0) {
            flashcardsIndex -= 1
        }
    }
    function flashcardsNext() {
        if (flashcardsIndex < (terms?.length - 1)) {
            flashcardsIndex += 1
        }

        if (
            flashcardsMaximized == true &&
            terms?.length > 4 &&
            flashcardsIndex == terms?.length - 1 &&
            flashcardsSeenWhileMax.size == terms?.length - 1
        ) {
            showConfetti = true;
        }
    }

    let mounted = $state(false);
    onMount(function () {
        mounted = true;
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
                case "j":
                    flashcardsPrev();
                    break;
                case "ArrowRight":
                case "l":
                case "k":
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

    let flashcardsMaximized = $state(false);
    function maximizeFlashcards() {
        flashcardsMaximized = true;
        footerState.hideFooter = true;

        fetch("/dashboard/set-dashboard-state", {
            method: "POST",
            credentials: "include"
        });
    }
    function unmaximizeFlashcards() {
        flashcardsMaximized = false;
        footerState.hideFooter = false;
    }

    beforeNavigate(() => {
        footerState.hideFooter = false;
    })
</script>
<style>
    .top-menu-link {
        margin-top: 0px;
        color: var(--fg-1);
        padding: 0.4rem 0.8rem;
        border-radius: 0.8rem;
    }
    .top-menu-link:hover {
        background-color: var(--bg-3);
    }
    .top-menu-link.current {
        color: var(--main);
        background-color: var(--bg-3);
    }
    .top-menu-link.current:hover {
        color: var(--main-alt);
    }
    .top-menu-nav {
        display: flex;
        flex-direction: row;
        gap: 1rem;
        align-items: center;
        margin-bottom: 1rem;
    }
</style>
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
    {#if !flashcardsMaximized}
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
    {/if}
      <div id="flashcards-outer-div">
        {#if flashcardsMaximized}
        <div class="flex">
            <button id="flashcards-unmaximize" class="faint" onclick={unmaximizeFlashcards}>
                <IconBackArrow /> Back
            </button>
        </div>
        {/if}
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
    {#if !flashcardsMaximized}
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
          <a href="/host?localId={data.localId}" class="button alt">
            <GroupIcon></GroupIcon>
            Review Game
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
            <a href="/host?studysetId={data.studyset.id}" class="button alt">
              <GroupIcon></GroupIcon>
              Review Game
            </a>
          {/if}
          
        </div>

        <div class="top-menu-nav">
            <a class="top-menu-link current" href="#">Terms</a>
            <a class="top-menu-link" style="display: flex; align-items: center; gap: 0.4rem;" href={
                data.local ?
                    `/studyset/local/stats?id=${data.localId}` :
                    `/studysets/${data.studyset.id}/stats`
            }>
                <IconGraph />
                Progress &amp; Stats
            </a>
        </div>
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
    {/if}
    </div>
  </div>
</main>
{#if showConfetti}
    <!-- fullscreen confetti -->
    <div style="position: fixed; top: -50px; left 0px; margin-top: 0px; height: 100vh; width: 100vw; display: flex; justify-content: center; overflow: hidden; pointer-events: none;">
        <Confetti x={[-5, 5]} y={[0, 0.1]} delay={[0, 6000]} duration={4000} amount=1000 fallDistance="200vh"/>
    </div>
{/if}
