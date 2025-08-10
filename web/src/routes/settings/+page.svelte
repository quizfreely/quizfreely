<script>
    // import { onMount } from "svelte";
    let { data } = $props();

    import IconCheckmark from "$lib/icons/Checkmark.svelte";

    // onMount(function () {
    // })
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
<p>Theme</p>
<div class="a-little-different-grid-list">
  <a href="/settings/themes/auto" class="button button-box no-clickable-effect {data.theme == 'auto' ? 'selected' : ''}">
    <img src="/img/theme-preview-auto.png" style="width:100%;border-radius:0.8rem" alt="Auto Dark/Light Theme Preview">
    <p>Auto</p>
  </a>
  <a href="/settings/themes/dark" class="button button-box no-clickable-effect {data.theme == 'dark' ? 'selected' : ''}">
    <img src="/img/theme-preview-dark.png" style="width:100%;border-radius:0.8rem" alt="Dark Theme Preview">
    <p>Dark</p>
  </a>
  <a href="/settings/themes/light" class="button button-box no-clickable-effect {data.theme == 'light' ? 'selected' : ''}">
    <img src="/img/theme-preview-light.png" style="width:100%;border-radius:0.8rem" alt="Light Theme Preview">
    <p>Light</p>
  </a>
</div>
<p>Date & Time</p>
<div>
  <div class="combo-select">
    <a href="/settings/date-time-format?clear=true" class="button left {
        data?.dateTimeFormatHours != "24" &&
        data?.dateTimeFormatHours != "12" ?
            "selected" :
            ""
    }">
        <IconCheckmark class="combo-selected-icon" />
        Auto
    </a>
    <a href="/settings/date-time-format?h=24" class="button mid {
        data?.dateTimeFormatHours == "24" ?
            "selected" :
            ""
    }">
      <IconCheckmark class="combo-selected-icon" />
      24 Hour
    </a>
    <a href="/settings/date-time-format?h=12" class="button right {
        data?.dateTimeFormatHours == "12" ?
            "selected" :
            ""
    }">
      <IconCheckmark class="combo-selected-icon" />
      12 Hour (AM/PM)
    </a>
  </div>
</div>
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
<!--<script>
  
</script>
{#if data.authed}
<script>
  
</script>
{/if}-->
