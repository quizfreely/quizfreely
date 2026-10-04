<script>
    import BackIcon from "$lib/icons/BackArrow.svelte";
    import SRSIcon from "$lib/icons/FlaskScienceSRS.svelte";
    let { data } = $props();
</script>
<div class="grid page">
    <div class="content">
        <div>
            <a href={
                /* data.cloudIds.length+data.localIds.length is always > 0 because of +page.js */
                data.cloudIds.length + data.localIds.length > 1 ?
                    `/combine?${[
                        ...data.cloudIds.map((id) => `studyset=${id}`),
                        ...data.localIds.map((id) => `localStudyset=${id}`),
                    ].join("&")}` :
                    data.cloudIds.length == 1 ?
                        `/studysets/${data.cloudIds[0]}` :
                        `/studyset/local?id=${data.localIds[0]}`
            } class="button faint" style="justify-self: start;">
                <BackIcon />
                Back
            </a>
        </div>
        <div class="flex" style="align-items: center; justify-content: center; gap: 1.2rem; margin-top: 2rem;">
            <SRSIcon width="2rem" height="2rem" />
            <span class="h3" style="margin-bottom: 0px;">Spaced Repetition</span>
        </div>
    </div>
</div>
