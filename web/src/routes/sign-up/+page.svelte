<script>
    import Noscript from "$lib/components/Noscript.svelte";
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";

    let { data } = $props();
    onMount(function () {
      if (!data.authed) {
        if (window.location.search.includes("?error")) {
          var urlParams = new URLSearchParams(window.location.search);
          document.getElementById("error-div").classList.remove("hide");
          document.getElementById("error-text").innerHTML =
            "<b>Error</b>: " + urlParams.get("error");
        }

        function signupSubmit() {
        if (
          document.getElementById("signupPasswordInput").value === document.getElementById("signupPasswordConfirmInput").value
        ) {
          document.getElementById("error-div").classList.add("hide");
          var username = document.getElementById("signupUsernameInput").value
          fetch("/api/v0/auth/sign-up", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              username: username,
              password: document.getElementById("signupPasswordInput").value
            })
          }).then(function (rawRes) {
            rawRes.json().then(function (response) {
              if (response.error) {
                document.getElementById("error-div").classList.remove("hide");
                if (response.error.code) {
                  document.getElementById("error-text").innerHTML =
                  "<b>Error</b>: " + response.error.code;
                } else {
                  document.getElementById("error-text").innerHTML =
                  "<b>Error</b>: " + response.error;
                }
              } else {
                goto("/dashboard");
                // window.location.reload();
              }
            }).catch(function (error) {
              console.error(error)
              document.getElementById("error-div").classList.remove("hide");
              document.getElementById("error-text").innerHTML =
              "<b>Error</b>: Can't connect to API? Or mabye it's response is invalid?";
            })
          }).catch(function (error) {
            console.error(error)
            document.getElementById("error-div").classList.remove("hide");
            document.getElementById("error-text").innerHTML =
            "<b>Error</b>: Can't connect to Quizfreely's API???";
          });
        } else {
          document.getElementById("error-div").classList.remove("hide");
          document.getElementById("error-text").innerHTML =
            "Passwords don't match <b>D:</b> <br />" +
            "Make sure you retyped your password how you want!";
        }
      }
      document.getElementById("signupButton").addEventListener("click", signupSubmit);
      document.getElementById("signupPasswordConfirmInput").addEventListener(
        "keyup",
        function (event) {
          if (event.key == "Enter") {
            signupSubmit();
          }
        }
      );
    }
    })
</script>

<style>
      .button.gaccount-button {
        background-color: #FeFeFe;
        color: #1F1F1F;
        font-family: Roboto, Inter, Arial, Helvetica, sans-serif;
        font-weight: 500;
        border: 0.2rem solid var(--border);
        border-radius: 2rem;
        padding: 0.6rem;
      }
      .button.gaccount-button:hover,
      .button.gaccount-button:focus,
      .button.gaccount-button:focus-visible {
        background-color: #f0f0f0;
        color: #1F1F1F;
      }

      .button.gaccount-button div.gaccount-container {
        display: flex;
        gap: 1rem;
        align-items: center;
        align-content: center;
        justify-items: center;
        justify-content: center;
      }

      .button.gaccount-button div.gaccount-container div {
        margin-top: 0px;
      }

      .gaccount-icon {
        width: 1.4rem;
        height: 1.4rem;
      }

      .button.noaccount-button {
        padding: 0.6rem 0.8rem;
        margin-bottom: 1rem;
      }
</style>

<svelte:head>
    <title>Sign up - Quizfreely</title>
    <meta name="description" content="Accounts on Quizfreely are optional and free! You can use Quizfreely without an account." />
</svelte:head>

<Noscript />
<main>
      <div id="error-div" class="grid page hide">
        <div class="content">
          <p id="error-text" class="box ohno">Error</p>
        </div>
      </div>
        {#if data.authed}
        <div id="signedin-div" class="grid page">
          <div class="content">
            <h2>You're signed in!</h2>
            <div class="flex">
              <a href="/dashboard" class="button yay large">Dashboard</a>
              <a href="/settings" class="button yay large alt">Settings</a>
            </div>
          </div>
        </div>
        {:else}
          <div id="account-div">
          <div class="grid thin-centered">
          <div class="content">
            <h2>Sign Up</h2>
            <div>
              <input
                type="text"
                class="fullWidth"
                id="signupUsernameInput"
                placeholder="Username"
                name="username"
                autocomplete="username"
              />
            </div>
            <div>
              <input
                type="password"
                class="fullWidth"
                id="signupPasswordInput"
                placeholder="Password"
                name="password"
                autocomplete="new-password"
              />
            </div>
            <div>
              <input
                type="password"
                class="fullWidth"
                id="signupPasswordConfirmInput"
                placeholder="Retype Password"
                name="confirm-password"
                autocomplete="new-password"
              />
            </div>
            <div>
              <button id="signupButton">Create account</button>
            </div>
            <div class="separator">or</div>
            <div>
              {#if data.enableOAuthGoogle}
              <a class="button fullWidth gaccount-button" href="/api/oauth/google">
                <div class="gaccount-container">
                  <div class="gaccount-icon">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" xmlns:xlink="http://www.w3.org/1999/xlink" style="display: block;">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                      <path fill="none" d="M0 0h48v48H0z"></path>
                    </svg>
                  </div>
                  <div>Sign up with Google</div>
                </div>
              </a>
              {/if}
            </div>
            <div>
              <a href="./dashboard" class="button fullWidth noaccount-button">
                Continue without an account
              </a>
            </div>
          </div>
          </div>
          <div class="grid thin-centered">
            <div class="content">
              <p class="center"><span class="fg0">By creating an account, you accept<br />our&nbsp;</span><a href="/privacy">Privacy Policy</a><span class="fg0">&nbsp;&amp;&nbsp;</span><a href="/terms">Terms of Service</a></p>
              <p class="center">Already have an account? <a href="./sign-in">Sign in</a></p>
            </div>
          </div>
        </div>
        {/if}
</main>
