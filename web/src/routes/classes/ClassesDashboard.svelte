<script>
    import { goto } from "$app/navigation";
    import Noscript from "$lib/components/Noscript.svelte";
    import PlusIcon from "$lib/icons/Plus.svelte";
    import { fade } from "svelte/transition";
    let { data } = $props();
    let enteredClassCode = $state("");
    let modalEnteredClassCode = $state("");
    let showJoinModal = $state(false);
</script>
<style>
.class-box {
    display: flex;
    gap: 0px;
    border-radius: 0.8rem;
}
.class-link {
    color: var(--fg-1);
}
.class-link:hover {
    color: var(--fg-0);
}
.split-style-container-thing {
    display: grid;
    gap: 0px;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto;
}
.split-style-container-thing .left-div {
    justify-self: end;
    margin-top: 0px;
    margin-right: 0px;
    padding-left: 1rem;
    padding-bottom: 1rem;
    padding-top: 1rem;
    padding-right: 4rem;
    border-right: 0.2rem solid var(--border);
}
.split-style-container-thing .right-div {
    justify-self: start;
    margin-top: 0px;
    margin-left: 0px;
    padding-left: 3.9rem;
    padding-bottom: 1rem;
    padding-top: 1rem;
    padding-right: 1rem;
}
.split-style-container-thing {
    text-align: center;
}
.split-style-container-thing input[type=text],
.split-style-container-thing ::placeholder {
    text-align: center;
}
@media only screen and (max-width: 800px) {
    .split-style-container-thing {
        display: grid;
        gap: 0px;
        grid-template-columns: auto;
        grid-template-rows: 1fr 1fr;
    }
    .split-style-container-thing .left-div {
        justify-self: center;
        border-right: none;
        margin-top: 0px;
        padding-left: 2rem;
        padding-bottom: 2rem;
        padding-top: 2rem;
        padding-right: 2rem;
    }
    .split-style-container-thing .right-div {
        justify-self: center;
        margin-top: 0px;
        margin-left: 0px;
        padding-left: 2rem;
        padding-bottom: 2rem;
        padding-top: 2rem;
        padding-right: 2rem;
    }
}
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

      .button.otheraccthing-button {
        padding: 0.6rem 0.8rem;
        margin-bottom: 1rem;
      }
</style>

<svelte:head>
    <title>Quizfreely Classes</title>
</svelte:head>

<Noscript />
<main>
    <div class="grid page">
        <div class="content">
            {#if data?.classesData?.classesAsTeacher?.length > 0 || data?.classesData?.classesAsStudent?.length > 0}
                <div class="flex" style="justify-items: flex-end; justify-content: flex-end;">
                <button onclick={() => showJoinModal = true} class="button alt">Join class</button>
                <a href="/classes/create-class" class="button alt"><PlusIcon></PlusIcon> Create class</a>
                </div>
            {/if}
            {#if data?.classesData?.classesAsTeacher?.length > 0 && data?.classesData?.classesAsStudent?.length > 0}
                <p>Teacher</p>
            {/if}
            {#if data?.classesData?.classesAsTeacher?.length > 0}
                <div class="grid list">
                    {#each data.classesData.classesAsTeacher as classobj}
                        <div class="box">
                            <a class="class-link" href="/classes/c/{classobj.id}">{classobj.name}</a>
                        </div>
                    {/each}
                </div>
            {/if}
            {#if data?.classesData?.classesAsTeacher?.length > 0 && data?.classesData?.classesAsStudent?.length > 0}
                <p>Student</p>
            {/if}
            {#if data?.classesData?.classesAsStudent?.length > 0}
                <div class="grid list">
                    {#each data.classesData.classesAsStudent as classobj}
                        <div class="box">
                            <a class="class-link" href="/classes/c/{classobj.id}">{classobj.name}</a>
                        </div>
                    {/each}
                </div>
            {/if}
            {#if !(data?.classesData?.classesAsStudent?.length > 0 || data?.classesData?.classesAsTeacher?.length > 0)}
                {#if data?.authed}
                <div class="split-style-container-thing">
                    <div class="left-div">
                        <h3>Students</h3>
                        <div style="display: flex; flex-direction: column; gap: 1rem;">
                            <input type="text" placeholder="Enter Class Code" style="width: 14rem;" bind:value={enteredClassCode}>
                            <button style="width: 14rem; margin-top: 0px;" onclick={function () {
                                fetch("/classes/api/graphql", {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json"
                                    },
                                    body: JSON.stringify({
                                        query: `mutation joinClass($classCode: String!) {
                                            joinClass(classCode: $classCode)
                                        }`,
                                        variables: {
                                            "classCode": enteredClassCode
                                        }
                                    })
                                }).then(function (result) {
                                    result.json().then(function (resultJson) {
                                        if (resultJson?.data?.joinClass) {
                                            /* joinClass returns class id */
                                            goto(`/classes/c/${resultJson?.data?.joinClass}`);
                                        } else {
                                            alert("invalid code");
                                        }
                                    }).catch(function (error) {
                                        console.error(
                                            "Error parsing API reponse as JSON while joining class w class code",
                                            error
                                        );
                                        alert("Error (the code you entered might be correct, but the API decided to not work)");
                                    })
                                }).catch(function (error) {
                                    console.error(
                                        "Error joining class w class code",
                                        error
                                    )
                                    alert("Error (the code you entered might be correct, but we couldn't reach the API, mabye check ur internet)")
                                })
                            }}>
                                Join
                            </button>
                        </div>
            {#if data.enableOAuthGoogle}
                        <div class="separator">or</div>
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
                            <div>Sign in with Google</div>
                          </div>
                        </a>
            {/if}
                    </div>
                    <div class="right-div">
                        <h3>Teachers</h3>
                            <a href="/classes/create-class" class="button" style="width: 14rem; margin-top: 0px;">
                            <PlusIcon></PlusIcon>
                            Create class
                        </a>
                    </div>
                </div>
                {:else}
      <div id="account-div">
        <div class="grid thin-centered">
          <div class="content">
                                <div>
            <a href="/sign-up" class="button alt fullWidth otheraccthing-button" style="width: 14rem; margin-top: 0px;">
                Sign up
            </a>
                </div>
            <a href="/sign-in" class="button alt fullWidth otheraccthing-button" style="width: 14rem; margin-top: 0px;">
                Sign in
            </a>
            {#if data.enableOAuthGoogle}
          <div class="separator">or</div>
            {/if}
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
                <div>Sign in with Google</div>
              </div>
            </a>
            {/if}
          </div>
        </div>
      </div>
    </div>
                {/if}
            {/if}
            <!-- <p style="white-space: pre"> -->
            <!-- {JSON.stringify( -->
            <!--     data.classesData, -->
            <!--     null, -->
            <!--     4 -->
            <!-- )} -->
            <!-- </p> -->
        </div>
    </div>
</main>
{#if showJoinModal}
    <div class="modal" transition:fade={{ duration: 200 }}>
        <div class="content">

                        <div style="display: flex; flex-direction: column; gap: 1rem; align-items: center; align-content: center">
                            <input type="text" placeholder="Enter Class Code" style="width: 14rem;" bind:value={modalEnteredClassCode}>
                            <button style="width: 14rem; margin-top: 0px;" onclick={function () {
                                fetch("/classes/api/graphql", {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json"
                                    },
                                    body: JSON.stringify({
                                        query: `mutation joinClass($classCode: String!) {
                                            joinClass(classCode: $classCode)
                                        }`,
                                        variables: {
                                            "classCode": modalEnteredClassCode
                                        }
                                    })
                                }).then(function (result) {
                                    result.json().then(function (resultJson) {
                                        if (resultJson?.data?.joinClass) {
                                            /* joinClass returns class id */
                                            goto(`/classes/c/${resultJson?.data?.joinClass}`);
                                        } else {
                                            alert("invalid code");
                                        }
                                    }).catch(function (error) {
                                        console.error(
                                            "Error parsing API reponse as JSON while joining class w class code",
                                            error
                                        );
                                        alert("Error (the code you entered might be correct, but the API decided to not work)");
                                    })
                                }).catch(function (error) {
                                    console.error(
                                        "Error joining class w class code",
                                        error
                                    )
                                    alert("Error (the code you entered might be correct, but we couldn't reach the API, mabye check ur internet)")
                                })
                            }}>
                                Join
                            </button>
                            <button class="alt" style="width: 14rem; margin-top: 0px;" onclick={() => showJoinModal = false}>
                                Close
                            </button>
                        </div>
        </div>
    </div>
{/if}

