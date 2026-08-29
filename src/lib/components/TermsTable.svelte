<script>
    let {
        terms,
        class: classProp = "",
        ...props
    } = $props();
</script>
<style>
    .term-image {
        max-width: 18.6rem;
        max-height: 300px;
        margin: 0px;
        padding: 0px;
        border-radius: 0.8rem;
    }
    .qzfr-terms-list {
        max-width: 90vw;
    }
</style>
<table class="outer box qzfr-terms-list {classProp}" {...props}>
    <tbody>
        <tr>
            <th>Term</th>
            <th>Definition</th>
        </tr>
        {#if terms != null}
            {#each terms as term}
                <tr>
                    <td style="vertical-align: top; padding: 0px;">
                        <div style="white-space: pre-wrap; overflow-wrap: break-word; padding-left: 1rem; padding-right: 1rem; padding-top: 1rem; padding-bottom: 0px;">{term.term}</div>
                        {#if term?.termImageUrl != null}
                            <div><img src={term.termImageUrl} alt="term image" class="term-image"></div>
                        {/if}
                    </td>
                    <td style="vertical-align: top; padding: 0px;">
                        <div style="white-space: pre-wrap; overflow-wrap: break-word; padding-left: 1rem; padding-right: 1rem; padding-top: 1rem; padding-bottom: 0px;">{term.def}</div>
                        {#if term?.defImageUrl != null}
                            <div style="padding-left: 0.6rem;"><img src={term.defImageUrl} alt="definition image" class="term-image"></div>
                        {/if}
                    </td>
                </tr>
            {/each}
        {/if}
    </tbody>
</table>
