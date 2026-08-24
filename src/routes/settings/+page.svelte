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
</script>
<style>
  .a-little-different-grid-list {
    display: grid;
    grid-template-rows: auto;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 1rem;
  }
  .a-little-different-grid-list > a {
    margin-top: 0px;
  }
</style>

<svelte:head>
  <title>Settings | Quizfreely</title>
</svelte:head>

<p>Theme</p>
<div class="a-little-different-grid-list">
  <a href="/settings/themes/auto" class="button button-box no-clickable-effect {data.theme == 'auto' ? 'selected' : ''}">
    <img src="/immutable/img/theme-preview-auto.png" style="width:100%;border-radius:0.8rem" alt="Auto Dark/Light Theme Preview">
    <p>Auto</p>
  </a>
  <a href="/settings/themes/dark" class="button button-box no-clickable-effect {data.theme == 'dark' ? 'selected' : ''}">
    <img src="/immutable/img/theme-preview-dark.png" style="width:100%;border-radius:0.8rem" alt="Dark Theme Preview">
    <p>Dark</p>
  </a>
  <a href="/settings/themes/light" class="button button-box no-clickable-effect {data.theme == 'light' ? 'selected' : ''}">
    <img src="/immutable/img/theme-preview-light.png" style="width:100%;border-radius:0.8rem" alt="Light Theme Preview">
    <p>Light</p>
  </a>
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
