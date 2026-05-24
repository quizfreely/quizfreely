<script>
    let { accept, multiple = false, onChangeCallback } = $props();
    let files;
    let filesArray = $state([]);
    let dropArea;
    let fileInput;
    let highlightDropArea = $state(false);
    let loading = $state(false);

    export function clear() {
        files = new DataTransfer().files
        fileInput.value = "";
        filesArray = [];
    }
    export function getFiles() {
        return files;
    }
    export function showLoading(show = true) {
        loading = show === false ? false : true;
    }
    export function hideLoading() {
        loading = false;
    }
</script>

<style>
.drop-area,
.drop-area.flex {
    display: flex;
    width: 80vw;
    min-height: 14rem;
    padding: 2rem;
    border: 0.2rem dashed var(--border);
    border-radius: 0.8rem;
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: center;
    transition: border-color 0.2s ease-out;
}
.drop-area.highlight,
.drop-area.flex.highlight {
    border-color: var(--main);
}
@media only screen and (min-width: 1000px) {
    .drop-area,
    .drop-area.flex {
        width: 60vw;
    }
}
</style>

<div class="drop-area flex {highlightDropArea ? "highlight" : ""}"
    bind:this={dropArea}
    ondragenter={e => {
        e.preventDefault();
        e.stopPropagation();
        highlightDropArea = true;
    }}
    ondragover={e => {
        e.preventDefault();
        e.stopPropagation();
        highlightDropArea = true;
    }}
    ondragleave={e => {
        e.preventDefault();
        e.stopPropagation();
        highlightDropArea = false;
    }}
    ondrop={e => {
        e.preventDefault();
        e.stopPropagation();
        highlightDropArea = false;
        files = e.dataTransfer.files;
        filesArray = Array.from(files);
        if (onChangeCallback) {
            onChangeCallback(files);
        }
    }}
>
    {#if loading}
        <div class="flex" style="align-items: center;">
            <div class="spinner fg1 size-1.6rem speed-slow"></div>
            <span style="font-size: 1.2rem;">Uploading</span>
        </div>
    {:else}
    <span>Drag & Drop Here or Select {multiple ? "Files" : "File"}</span>
    <label class="button">
        Select {multiple ? "File" : "File"}
        <input type="file" {accept} {multiple} class="invisible" bind:this={fileInput} onchange={e => {
            files = e.target.files;
            filesArray = Array.from(files);
            if (onChangeCallback) {
                onChangeCallback(files);
            }
        }}>
    </label>
    {/if}
    {#if filesArray.length > 0}
    <div style="width: 100%; padding-bottom: 0px; padding-top: 1rem; padding-left: 0px; padding-right: 0px;">
    <span class="fg0">Selected:</span>
    <div class="flex compact-gap" style="margin-top: 0.4rem; flex-direction: column; align-items: start;">
        {#each filesArray as file}
            <span>{file.name}</span>
        {/each}
    </div>
    </div>
    {/if}
</div>

