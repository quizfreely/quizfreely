<script>
    import { onMount } from "svelte";
    let { data } = $props();
    let modPowersActive = $state(false);

    import IconPencil from "$lib/icons/Pencil.svelte";
    import IconCheckmark from "$lib/icons/Checkmark.svelte";
    import IconTrash from "$lib/icons/Trash.svelte";

    onMount(function () {
        if (data.authed) {
            document.getElementById("display-name-edit-button").addEventListener("click", function () {
                document.getElementById("display-name-edit").value = document.getElementById("account-display-name").innerText;
                document.getElementById("display-name-edit-div").classList.remove("hide");
                document.getElementById("display-name-view-div").classList.add("hide");
            })
            document.getElementById("display-name-edit-save-button").addEventListener("click", function () {
    const displayName = document.getElementById("display-name-edit").value;
    
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
                displayName: displayName
            }
        })
    }).then(response => response.json())
    .then(result => {
        if (result.errors) {
            console.error(result.errors);
        } else if (result.data?.updateUser) {
            document.getElementById("account-display-name").innerText = result.data.updateUser.displayName;
        }
        document.getElementById("display-name-view-div").classList.remove("hide");
        document.getElementById("display-name-edit-div").classList.add("hide");
    });
            })
            document.getElementById("display-name-edit-cancel-button").addEventListener("click", function () {
                document.getElementById("display-name-view-div").classList.remove("hide");
                document.getElementById("display-name-edit-div").classList.add("hide");
            })
            document.getElementById("account-sign-out-button").addEventListener("click", async function () {
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
            })
            document.getElementById("show-delete-account-modal").addEventListener("click", function () {
                document.getElementById("delete-account-modal").classList.remove("hide");
            })
            document.getElementById("hide-delete-account-modal").addEventListener("click", function () {
                document.getElementById("delete-account-modal").classList.add("hide");
                document.getElementById("delete-account-confirm-password-input").value = "";
            })
            document.getElementById("delete-account-delete-all-my-studysets-false").addEventListener("click", function () {
                document.getElementById("delete-account-delete-all-my-studysets-true").classList.remove("selected");
                document.getElementById("delete-account-delete-all-my-studysets-false").classList.add("selected");
            })
            document.getElementById("delete-account-delete-all-my-studysets-true").addEventListener("click", function () {
                document.getElementById("delete-account-delete-all-my-studysets-true").classList.add("selected");
                document.getElementById("delete-account-delete-all-my-studysets-false").classList.remove("selected");
            })
            document.getElementById("delete-account-confirm-button").addEventListener("click", function () {
                if (data.authedUser.authType == "OAUTH_GOOGLE" || document.getElementById("delete-account-confirm-password-input").value.length > 0) {
                    var reqBody = {
                        deleteAllMyStudysets: document.getElementById("delete-account-delete-all-my-studysets-true").classList.contains("selected"),
                    };
                    if (data.authedUser.authType != "OAUTH_GOOGLE") {
                        reqBody.confirmPassword = document.getElementById("delete-account-confirm-password-input").value
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
            })
            modPowersActive = localStorage.getItem("quizfreely:modPowersActive");
        }
    })
</script>

{#if data.authed}
<div id="account-signedin-div" class="box">
  <div class="flex compact-gap align-end" id="display-name-view-div">
    <p>
      <span class="h6">Display name:</span>
      <span class="line" id="account-display-name">{ data.authedUser.displayName }</span>
    </p>
    <button class="icon-only-button" id="display-name-edit-button" aria-label="Edit"><IconPencil /></button>
  </div>
  <div id="display-name-edit-div" class="hide" style="margin-top:0px">
    <p class="h6" style="margin-bottom:0.6rem">Display Name:</p>
    <div class="flex" style="margin-top:0px">
      <input type="text" id="display-name-edit" placeholder="Display Name" value={ data.authedUser.displayName } />
    </div>
    <div class="flex">
      <button id="display-name-edit-save-button">Save</button>
      <button id="display-name-edit-cancel-button" class="alt">Cancel</button>
    </div>
  </div>
  {#if data.authedUser.authType == "OAUTH_GOOGLE"}
  <div id="account-oauth-google-div">
      <p class="fg0">Signed in with Google</p>
      <p>
        <span class="h6">Google account:</span>
        <span class="line" id="account-oauth-google-email">{ data.authedUser.oauthGoogleEmail }</span>
      </p>
    </div>
  {:else}
  <div id="account-username-password-div">
    <p>
      <span class="h6">Username:</span>
      <span class="line" id="account-username">{ data.authedUser.username }</span>
    </p>
  </div>
  {/if}
  <div class="flex">
    <button id="account-sign-out-button" class="ohno">Sign out</button>
  </div>
  <details>
      <summary>More actions</summary>
      <div>
          <p>If you want to delete your account, you can choose if you want to keep your public studysets or delete all of your content before confirming.</p>
          <button id="show-delete-account-modal" class="ohno alt"><IconTrash /> Delete Account</button>
      </div>
  </details>
</div>
    {#if data.authedUser.modPerms && modPowersActive}
        <button class="yay alt" style="margin-top: 2rem;" onclick={() => {
            localStorage.setItem("quizfreely:modPowersActive", "false");
            modPowersActive = false;
        }}>Hide Mod Powers</button>
    {:else if data.authedUser.modPerms}
        <button class="yay alt" style="margin-top: 2rem;" onclick={() => {
            localStorage.setItem("quizfreely:modPowersActive", "true");
            modPowersActive = true;
        }}>Activate Mod Powers</button>
    {/if}
{:else}
<div id="account-not-signedin-div" class="box">
  <p>
    You're not signed in.
    <span class="line">Do you want to <a href="/sign-in">sign in</a> or <a href="/sign-up">create an account</a>?</span>
  </p>
</div>
{/if}
{#if data.authed}
<div class="modal hide" id="delete-account-modal">
  <div class="content">
      <p class="h4">Are you sure you want to delete your account?</p>
      <p>
          You can keep your public studysets or delete all your studysets (public and private).
          <span class="line">This will not delete local studysets saved on your device (not in your account).</span>
      </p>
      <div class="combo-select">
          <button id="delete-account-delete-all-my-studysets-false" class="left selected">
            <IconCheckmark class="combo-selected-icon" />
            Keep public sets
          </button>
          <button id="delete-account-delete-all-my-studysets-true" class="right">
            <IconCheckmark class="combo-selected-icon" />
            Delete all sets
          </button>
      </div>
      <p class="fg0" style="margin-top: 2rem;">
          This will delete all data/content in your account.
          <span class="line">Even if you keep your public studysets, all your account/profile info will be deleted.</span>
      </p>
      {#if !(data.authedUser.authType == "OAUTH_GOOGLE") }
          <div><input type="password" placeholder="Enter password to confirm" id="delete-account-confirm-password-input"></div>
      {/if}
      <div class="flex">
          <button id="delete-account-confirm-button" class="ohno alt"><IconTrash /> Delete Account</button>
          <button id="hide-delete-account-modal" class="alt">Cancel</button>
      </div>
  </div>
</div>
{/if}
