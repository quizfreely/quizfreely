<script>
    import IconMoreDotsHorizontal from "$lib/icons/MoreDotsHorizontal.svelte"
    import IconArrowUp from "$lib/icons/ArrowUp.svelte"
    import IconArrowDown from "$lib/icons/ArrowDown.svelte"
    import IconTrash from "$lib/icons/Trash.svelte"

</script>
<div class="box">
    <input type="text" placeholder="Term" />
    <textarea
        class="vertical"
        rows="2"
        placeholder="Definition"
        oninput={resizeTextarea}
    >
    </textarea>
    <div class="flex center">
        <div class="dropdown">
            <button class="dropdown-toggle" aria-label="Actions dropdown menu">
                <IconMoreDotsHorizontal />
            </button>
            <div class="content">
                <button onclick={
                    function (event) {
                        document.getElementById("edit-terms-rows").insertBefore(
                            document.parentElement.parentElement.parentElement.parentElement,
                            document.parentElement.parentElement.parentElement.parentElement.previousElementSibling
                        )
                    }
                }>
                    <IconArrowUp /> Move Up
                </button>
                <button onclick={
                    function (event) {
                        document.getElementById("edit-terms-rows").insertBefore(
                            document.parentElement.parentElement.parentElement.parentElement,
                            document.parentElement.parentElement.parentElement.parentElement.nextElementSibling
                        )
                    }
                }>
                    <IconArrowDown /> Move Down
                </button>
                <button onclick={
                    function (event) {
                        event.target.parentElement.parentElement.parentElement.parentElement.remove()
                    }
                }>
                    <IconTrash /> Delete
                </button>
            </div>
        </div>
    </div>
</div>
