<script>
    import { onMount, tick } from "svelte";
    let { data } = $props();
    let modPowersActive = $state(false);

    import IconPencil from "$lib/icons/Pencil.svelte";
    import IconCheckmark from "$lib/icons/Checkmark.svelte";
    import IconTrash from "$lib/icons/Trash.svelte";

    let displayName = $state(data.authedUser?.displayName || "");
    let displayNameInput = $state("");
    let isEditingDisplayName = $state(false);
    let displayNameEditInputEl = $state();

    let showDeleteAccountModal = $state(false);
    let deleteAccountConfirmPassword = $state("");
    let deleteAllMyStudysets = $state(false);

    onMount(function () {
        if (data.authed) {
            modPowersActive = localStorage.getItem("quizfreely:modPowersActive") == "true";
        }
    });

    async function editDisplayName() {
        displayNameInput = displayName;
        isEditingDisplayName = true;
        await tick();
        displayNameEditInputEl?.focus();
    }

    async function saveDisplayName() {
        fetch("/api/graphql", {
            method: "POST",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query: `
                    mutation UpdateDisplayName($displayName: String) {
                        updateUser(displayName: $displayName) {
                            displayName
                        }
                    }
                `,
                variables: {
                    displayName: displayNameInput
                }
            })
        }).then(response => response.json())
        .then(result => {
            if (result.errors) {
                console.error(result.errors);
            } else if (result.data?.updateUser) {
                displayName = result.data.updateUser.displayName;
            }
            isEditingDisplayName = false;
        });
    }

    function cancelDisplayNameEdit() {
        isEditingDisplayName = false;
    }

    async function signOut() {
        try {
            const rawResp = await fetch("/api/v0/auth/sign-out", {
                method: "POST",
                credentials: "same-origin",
            });
            const resp = await rawResp.json();
            if (resp.error) {
                console.log("Failed to sign out, api response: ", resp);
            } else {
                window.location.reload();
            }
        } catch (err) {
            console.error("Error signing out: ", err);
        }
    }

    function hideDeleteModal() {
        showDeleteAccountModal = false;
        deleteAccountConfirmPassword = "";
    }

    function confirmDeleteAccount() {
        if (data.authedUser.authType == "OAUTH_GOOGLE" || deleteAccountConfirmPassword.length > 0) {
            var reqBody = {
                deleteAllMyStudysets: deleteAllMyStudysets,
            };
            if (data.authedUser.authType != "OAUTH_GOOGLE") {
                reqBody.confirmPassword = deleteAccountConfirmPassword;
            };
            fetch("/api/v0/auth/delete-account", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(reqBody)
            }).then(function (response) {
                response.json().then(function (responseJSON) {
                    if (responseJSON.error) {
                        console.error(responseJSON.error);
                        if (data.authedUser.authType == "OAUTH_GOOGLE") {
                            alert("API Error, idk why skull emoji")
                        } else {
                            alert("API Errored (but nicely), check your password mabye?");
                        }
                    } else {
                        window.location.reload();
                    }
                }).catch(function (error) {
                    alert("Error while parsing API response JSON")
                })
            }).catch(function error() {
                alert("Error making request, mabye qzfr-api is down?")
            })
        }
    }
</script>

{#if data.authed}
<div class="box">
  {#if !isEditingDisplayName}
    <div class="flex compact-gap align-end">
      <p>
        <span class="h6">Display name:</span>
        <span class="line">{ displayName }</span>
      </p>
      <button class="icon-only-button" onclick={editDisplayName} aria-label="Edit"><IconPencil /></button>
    </div>
  {:else}
    <div style="margin-top:0px">
      <p class="h6" style="margin-bottom:0.6rem">Display Name:</p>
      <div class="flex" style="margin-top:0px">
        <input type="text" bind:this={displayNameEditInputEl} bind:value={displayNameInput} placeholder="Display Name" />
      </div>
      <div class="flex">
        <button onclick={saveDisplayName}>Save</button>
        <button onclick={cancelDisplayNameEdit} class="alt">Cancel</button>
      </div>
    </div>
  {/if}
  {#if data.authedUser.authType == "OAUTH_GOOGLE"}
    <div>
      <p class="fg0">Signed in with Google</p>
      <p>
        <span class="h6">Google account:</span>
        <span class="line">{ data.authedUser.oauthGoogleEmail }</span>
      </p>
    </div>
  {:else}
    <div>
      <p>
        <span class="h6">Username:</span>
        <span class="line">{ data.authedUser.username }</span>
      </p>
    </div>
  {/if}
  <div class="flex">
    <button onclick={signOut} class="ohno">Sign out</button>
  </div>
  <details>
      <summary>More actions</summary>
      <div>
          <p>If you want to delete your account, you can choose if you want to keep your public studysets or delete all of your content before confirming.</p>
          <button onclick={() => showDeleteAccountModal = true} class="ohno alt"><IconTrash /> Delete Account</button>
      </div>
  </details>
</div>
    {#if data.authedUser.modPerms && modPowersActive}
        <button class="yay alt" style="margin-top: 2rem;" onclick={() => {
            localStorage.setItem("quizfreely:modPowersActive", "false");
            modPowersActive = false;
        }}>Hide Special Powers</button>
    {:else if data.authedUser.modPerms}
        <button class="yay alt" style="margin-top: 2rem;" onclick={() => {
            localStorage.setItem("quizfreely:modPowersActive", "true");
            modPowersActive = true;
        }}>Activate Special Powers</button>
    {/if}
{/if}

{#if !data.authed}
<div class="box">
  <p>
    You're not signed in.
    <span class="line">Do you want to <a href="/sign-in">sign in</a> or <a href="/sign-up">create an account</a>?</span>
  </p>
</div>
{/if}

{#if data.authed && showDeleteAccountModal}
<div class="modal">
  <div class="content">
      <p class="h4">Are you sure you want to delete your account?</p>
      <p>
          You can keep your public studysets or delete all your studysets (public and private).
          <span class="line">This will not delete local studysets saved on your device (not in your account).</span>
      </p>
      <div class="combo-select">
          <button onclick={() => deleteAllMyStudysets = false} class="left" class:selected={!deleteAllMyStudysets}>
            <IconCheckmark class="combo-selected-icon" />
            Keep public sets
          </button>
          <button onclick={() => deleteAllMyStudysets = true} class="right" class:selected={deleteAllMyStudysets}>
            <IconCheckmark class="combo-selected-icon" />
            Delete all sets
          </button>
      </div>
      <p class="fg0" style="margin-top: 2rem;">
          This will delete all data/content in your account.
          <span class="line">Even if you keep your public studysets, all your account/profile info will be deleted.</span>
      </p>
      {#if !(data.authedUser.authType == "OAUTH_GOOGLE") }
          <div><input type="password" placeholder="Enter password to confirm" bind:value={deleteAccountConfirmPassword}></div>
      {/if}
      <div class="flex">
          <button onclick={confirmDeleteAccount} class="ohno alt"><IconTrash /> Delete Account</button>
          <button onclick={hideDeleteModal} class="alt">Cancel</button>
      </div>
  </div>
</div>
{/if}
