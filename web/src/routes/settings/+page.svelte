<script>
    import Noscript from "$lib/components/Noscript.svelte";
    import { onMount } from "svelte";
    let { data } = $props();

    import IconPencil from "$lib/icons/Pencil.svelte";
    import IconCheckmark from "$lib/icons/Checkmark.svelte";
    import IconTrash from "$lib/icons/Trash.svelte";

    onMount(function () {
        document.getElementById("time-24h").addEventListener("click", function () {
            document.getElementById("time-24h").classList.add("selected")
            document.getElementById("time-12h").classList.remove("selected")
            if (window.localStorage) {
                localStorage.setItem("settingTimeHour", "24h")
            }
        })
        document.getElementById("time-12h").addEventListener("click", function () {
            document.getElementById("time-24h").classList.remove("selected")
            document.getElementById("time-12h").classList.add("selected")
            if (window.localStorage) {
                localStorage.setItem("settingTimeHour", "12h")
            }
        })
        if (window.localStorage && (localStorage.getItem("settingTimeHour") == "24h")) {
            document.getElementById("time-24h").classList.add("selected")
            document.getElementById("time-12h").classList.remove("selected")
        } else if (window.localStorage && (localStorage.getItem("settingTimeHour") == "12h")) {
            document.getElementById("time-24h").classList.remove("selected")
            document.getElementById("time-12h").classList.add("selected")
        }

        if (data.authed) {
            document.getElementById("display-name-edit-button").addEventListener("click", function () {
                document.getElementById("display-name-edit").value = document.getElementById("account-display-name").innerText;
                document.getElementById("display-name-edit-div").classList.remove("hide");
                document.getElementById("display-name-view-div").classList.add("hide");
            })
            document.getElementById("display-name-edit-save-button").addEventListener("click", function () {
                fetch("/api/v0/auth/user", {
                    method: "PATCH",
                    credentials: "same-origin",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        display_name: document.getElementById("display-name-edit").value
                    })
                }).then(function (rawResponse) {
                    rawResponse.json().then(function (response) {
                        if (response.data && response.data.user) {
                            document.getElementById("account-display-name").innerText = response.data.user.display_name;
                        }
                        document.getElementById("display-name-view-div").classList.remove("hide");
                        document.getElementById("display-name-edit-div").classList.add("hide");
                    })
                })
            })
            document.getElementById("display-name-edit-cancel-button").addEventListener("click", function () {
                document.getElementById("display-name-view-div").classList.remove("hide");
                document.getElementById("display-name-edit-div").classList.add("hide");
            })
            document.getElementById("account-sign-out-button").addEventListener("click", function () {
                fetch("/api/v0/auth/sign-out", {
                    method: "POST",
                    credentials: "same-origin",
                }).then(function (rawResponse) {
                    window.location.reload();
                })
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
                if (data.authedUser.auth_type == "oauth_google" || document.getElementById("delete-account-confirm-password-input").value.length > 0) {
                    var reqBody = {
                        deleteAllMyStudysets: document.getElementById("delete-account-delete-all-my-studysets-true").classList.contains("selected"),
                    };
                    if (data.authedUser.auth_type != "oauth_google") {
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
                                if (data.authedUser.auth_type == "oauth_google") {
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
        }
    })
</script>

<svelte:head>
  <title>Quizfreely Settings</title>
</svelte:head>

<Noscript />
<main>
  <div class="grid page">
    <div class="content">
      <h3>Settings</h3>
      <p>Theme</p>
      <div class="grid list">
        <a href="/settings/themes/auto" class="button button-box no-clickable-effect {data.theme == 'auto' ? 'selected' : ''}">
          <img src="/img/themes/theme-preview-auto.png" style="width:100%;border-radius:0.8rem" alt="Auto Dark/Light Theme Preview">
          <p>Auto</p>
        </a>
        <a href="/settings/themes/dark" class="button button-box no-clickable-effect {data.theme == 'dark' ? 'selected' : ''}">
          <img src="/img/themes/theme-preview-dark.png" style="width:100%;border-radius:0.8rem" alt="Dark Theme Preview">
          <p>Dark</p>
        </a>
        <a href="/settings/themes/light" class="button button-box no-clickable-effect {data.theme == 'light' ? 'selected' : ''}">
          <img src="/img/themes/theme-preview-light.png" style="width:100%;border-radius:0.8rem" alt="Light Theme Preview">
          <p>Light</p>
        </a>
      </div>
      <p>Date & Time</p>
      <div>
        <div class="combo-select">
          <button id="time-24h" class="left">
            <IconCheckmark class="combo-selected-icon" />
            24 Hour
          </button>
          <!--
            12h has selected class by default before being modified by js with localStorage
            because everywhere else also defaults to 12h if the setting isn't set in localStorage
          -->
          <button id="time-12h" class="right selected">
            <IconCheckmark class="combo-selected-icon" />
            12 Hour (AM/PM)
          </button>
        </div>
      </div>
      <h3>Account Settings</h3>
      {#if data.authed}
      <div id="account-signedin-div" class="box">
        <div class="flex compact-gap align-end" id="display-name-view-div">
          <p>
            <span class="h6">Display name:</span><br />
            <span id="account-display-name">{ data.authedUser.display_name }</span>
          </p>
          <button class="icon-only-button" id="display-name-edit-button" aria-label="Edit"><IconPencil /></button>
        </div>
        <div id="display-name-edit-div" class="hide" style="margin-top:0px">
          <p class="h6" style="margin-bottom:0.6rem">Display Name:</p>
          <div class="flex" style="margin-top:0px">
            <input type="text" id="display-name-edit" placeholder="Display Name" value={ data.authedUser.display_name } />
          </div>
          <div class="flex">
            <button id="display-name-edit-save-button">Save</button>
            <button id="display-name-edit-cancel-button" class="alt">Cancel</button>
          </div>
        </div>
        {#if data.authedUser.auth_type == "oauth_google"}
        <div id="account-oauth-google-div">
            <p class="fg0">Signed in with Google</p>
            <p>
              <span class="h6">Google account:</span><br />
              <span id="account-oauth-google-email">{ data.authedUser.oauth_google_email }</span>
            </p>
          </div>
        {:else}
        <div id="account-username-password-div">
          <p>
            <span class="h6">Username:</span><br />
            <span id="account-username">{ data.authedUser.username }</span>
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
      {:else}
      <div id="account-not-signedin-div" class="box">
        <p>
          You're not signed in.<br />
          Do you want to <a href="./sign-in">sign in</a> or <a href="./sign-up">create an account</a>?
        </p>
      </div>
      {/if}
      {#if data.authed}
      <div class="modal hide" id="delete-account-modal">
        <div class="content">
            <p class="h4">Are you sure you want to delete your account?</p>
            <p>You can keep your public studysets or delete all your studysets (public and private). <br>This will not delete local studysets saved on your device (not in your account).</p>
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
            <br>
            <p class="fg0">This will delete all data/content in your account. <br>Even if you keep your public studysets, all your account/profile info will be deleted.</p>
            {#if !(data.authedUser.auth_type == "oauth_google") }
                <div><input type="password" placeholder="Enter password to confirm" id="delete-account-confirm-password-input"></div>
            {/if}
            <div class="flex">
                <button id="delete-account-confirm-button" class="ohno alt"><IconTrash /> Delete Account</button>
                <button id="hide-delete-account-modal" class="alt">Cancel</button>
            </div>
        </div>
      </div>
      {/if}
      <!--<h3>Data & Privacy</h3>
      <div class="box">
        <p>Some settings are stored as cookies.<br />
        Quizfreely does not use third-party cookies or trackers.<br />
        Clearing cookies will reset some settings and sign you out.</p>
        <a href="/settings/clear-cookies" class="button ohno">Clear cookies</a>
        <p>
          ~~Local data~~ and some settings are saved using localStorage.<br/>
          Clearing localStorage will delete local/on-device studysets and will sign out of your account.
        </p>
        <button class="ohno">Clear localStorage</button>
      </div>
      <div class="modal hide">
        <div class="content">
          <p></p>
        </div>
      </div>-->
    </div>
  </div>
</main>
<!--<script>
  
</script>
{#if data.authed}
<script>
  
</script>
{/if}-->
