<script>
    let {value = $bindable(), div, textarea} = $props();
    /*
        `textarea` and `div` are spread below
        like this: `{...textarea}` and `{...div}`,
        so attributes under textarea get applied to the textarea
        and attributes under div are applied to the div container
        
        for example
        <AutoResizeTextarea textarea={{ placeholder: "abc" }} />
        would give us
        <div>
            <textarea placeholder="abc"></textarea>
        </div>

        value is not under `textarea` so it can be used with bind easily:
        <AutoResizeTextarea bind:value={something} />
    */
</script>

<style>
.auto-resize-textarea-div {
    display: grid;
    /* since the textarea is in this grid layout,
    the ::after element (with the same text as the textarea)
    will increase the size of the textarea automatically
    when the text changes size
    
    in some cases if the data attribute text doesnt get set on creation,
    the textarea itself will still make the grid container tall enough
    because the grid container has the tallest one's height
    
    the data attribute is updated on input and on focus, see below */
}
.auto-resize-textarea-div::after {
    content: attr(data-autoresizetextvalue) " ";
    visibility: hidden;
}
.auto-resize-textarea-div > textarea {
    resize: none;
}
.auto-resize-textarea-div > textarea,
.auto-resize-textarea-div::after {
    /* overlap elements to get same height */
    grid-area: 1 / 1 / 2 / 2;
    white-space: pre-wrap;

    overflow-y: hidden;
    overflow-x: hidden;

    /* same styling as normal textarea to get same height */
    box-sizing: border-box;
    text-align: left;
    text-decoration: none;
    color: var(--fg-1);
    outline: none;
    padding: 0.4rem 0.8rem;
    font-size: 1rem;
    line-height: 1.4;
    transition-duration: 0.4s;
    border: 0.2rem solid var(--border); /* even tiny things like borders effects the size especially with line wrapping, so these properties are also styled the same for the real textarea and the fake overlapped element */
}
</style>

<!-- notice class is AFTER `...div` because we're overwriting class from spread props -->
<div {...div} class={["auto-resize-textarea-div", div?.class ?? ""]} data-autoresizetextvalue={value}>
    <textarea bind:value={value} {...textarea} ></textarea>
</div>
