<script>
    let { accept, multiple = false, onChangeCallback } = $props();
    let files;
    let filesArray = $state([]);
    let dropArea;
    let fileInput;
    let highlightDropArea = $state(false);

    export function clear() {
        fileInput.value = "";
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
</style>

<div class="drop-area flex {highlightDropArea ? "highlight" : ""}"
    bind:this={dropArea}
    ondragenter={e => {
        e.preventDefault();
        e.stopPropagation();
        highlightDropArea = true;
        console.log("did it work")
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
    }}>
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
    {#if filesArray.length > 0}
    <div style="width: 100%; padding-bottom: 0px; padding-top: 2rem; padding-left: 0px; padding-right: 0px;">
    <span class="fg0">Selected:</span>
    <div class="flex compact-gap" style="margin-top: 0.4rem; flex-direction: column; align-items: start;">
        {#each filesArray as file}
            <span>{file.name}</span>
        {/each}
    </div>
    </div>
    {/if}
</div>

