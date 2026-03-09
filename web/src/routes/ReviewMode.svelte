<script lang="ts">
    import { idbApiLayer } from "@quizfreely/idb-api-layer";
    let { data } = $props();
</script>
<div class="grid page">
    <div class="content">
        <button class="button-box">
            Balanced
        </button>
        <button class="button-box">
            Accuracy
            Practice terms with the lowest accuracy
        </button>
        <button class="button-box">
            Memory
            Practice old terms that you haven't seen in a while
        </button>
        <button class="button-box">
            Frequently Confused Terms
            Practice terms that you frequently mix up
        </button>
    </div>
</div>
