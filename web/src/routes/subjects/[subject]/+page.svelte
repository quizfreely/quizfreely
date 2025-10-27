<script>
    import BackIcon from "$lib/icons/BackArrow.svelte";
    let { data } = $props();
</script>
<div class="grid page">
    <div class="content">
        <div class="flex">
            <a class="button faint" href="/explore">
                <BackIcon></BackIcon> Back
            </a>
        </div>
        <h3>{categoryName}</h3>
        <p class="fg0">{data?.subjects?.length} Subjects</p>
        <div class="grid list">
            {#each data?.subjects as subject}
                <a class="button button-box" href="subjects/subject.id">
                    {subject.name}
                </a>
            {/each}
        </div>
    </div>
</div>
