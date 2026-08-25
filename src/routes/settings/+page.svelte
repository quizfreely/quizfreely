<script>
    import { onMount } from "svelte";
    import IconCheckmark from "$lib/icons/Checkmark.svelte";
    let { data } = $props();

    let fmtHours = $state(null);
    onMount(function () {
        try {
            const getFmtHours = window.localStorage.getItem("quizfreely:fmt_hours");
            if (getFmtHours == "24" || getFmtHours == "12") {
                fmtHours = getFmtHours;
            }
        } catch (err) {
            console.log("No localStorage? 😭 Err:", err);
        }
    })

    /* quizfreely:fmt_hours (value) is "24", "12", or "AUTO" */
    function setFmtHours(value) {
        try {
            window.localStorage.setItem("quizfreely:fmt_hours", value);
            fmtHours = value;
        } catch (err) {
            console.log("setFmtHours localStorage ERR:", err);
        }
    }
    
    let theme = $state(data.theme);
    function setTheme(newTheme) {
        try {
            const cookieName = "theme";
            const cookieValue = encodeURIComponent(newTheme);
            const maxAge = 60 * 60 * 24 * 365; // 1 year in seconds
            document.cookie = `${cookieName}=${cookieValue}; max-age=${maxAge}; path=/; SameSite=Lax; Secure`;
            document.documentElement.classList.remove("theme-dark", "theme-light");
            document.documentElement.classList.add(`theme-${newTheme}`);
            theme = newTheme;
        } catch (error) {
            console.error("Failed to save theme cookie; err:", error);
        }
    }
</script>
<style>
  .a-little-different-grid-list {
    display: grid;
    grid-template-rows: auto;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 1rem;
  }
  .a-little-different-grid-list > button {
    margin-top: 0px;
  }
  .button-box img {
    width: 100%;
    height: auto;
  }
</style>

<svelte:head>
  <title>Settings | Quizfreely</title>
</svelte:head>

<p>Theme</p>
<div class="a-little-different-grid-list">
  <button onclick={() => setTheme("auto")} class="button-box no-clickable-effect {theme == 'auto' ? 'selected' : ''}">
    <enhanced:img src="./img/theme-preview-auto.png" style="border-radius:0.8rem" alt="Auto Dark/Light Theme Preview" />
    <p>Auto</p>
  </button>
  <button onclick={() => setTheme("dark")} class="button-box no-clickable-effect {theme == 'dark' ? 'selected' : ''}">
    <enhanced:img src="./img/theme-preview-dark.png" style="border-radius:0.8rem" alt="Dark Theme Preview" />
    <p>Dark</p>
  </button>
  <button onclick={() => setTheme("light")} class="button-box no-clickable-effect {theme == 'light' ? 'selected' : ''}">
    <enhanced:img src="./img/theme-preview-light.png" style="border-radius:0.8rem" alt="Light Theme Preview" />
    <p>Light</p>
  </button>
</div>
<p>Date &amp; Time</p>
<div>
  <div class="flex">
    <button onclick={() => setFmtHours("AUTO")} class="button-box {
        (fmtHours != "24" && fmtHours != "12") ? "selected" : ""
    }">
        <IconCheckmark class="button-box-selected-icon" />
        Auto
    </button>
    <button onclick={() => setFmtHours("24")} class="button-box {
        fmtHours == "24" ? "selected" : ""
    }">
      <IconCheckmark class="button-box-selected-icon" />
      24 Hour
    </button>
    <button onclick={() => setFmtHours("12")} class="button-box {
        fmtHours == "12" ? "selected" : ""
    }">
      <IconCheckmark class="button-box-selected-icon" />
      12 Hour (AM/PM)
    </button>
  </div>
</div>
