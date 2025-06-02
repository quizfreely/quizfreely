<script>
    import AssignmentStudentView from "../../../../AssignmentStudentView.svelte";
    import IconBackArrow from "$lib/icons/BackArrow.svelte";
    let { data } = $props();
</script>
<style>
    .description-container {
        white-space: pre-wrap;
    }
    :global {
        /* the `p` elements are created after svelte like "compiles" styles
        so it needs to be in `:global` */
        .description-container p:empty::before {
            content: "\00a0"; /* nbsp, non-breaking space */
        }
    }
    .assignment-container-grid {
        display: grid;
        gap: 1rem;
        grid-template-columns: 4fr 1fr;
        grid-template-rows: auto;
        grid-template-areas: "details work";
    }
    .assignment-container-grid .assignment-details {
        grid-area: details;
    }
    .assignment-container-grid .assignment-work {
        grid-area: work;
    }
    @media only screen and (max-width: 800px) {
        .assignment-container-grid {
            grid-template-columns: auto;
            grid-template-rows: auto auto;
            grid-template-areas:
                "details"
                "work";
        }
    }
</style>
<div class="grid page">
    <div class="content">
        <div>
            <a href="/classes/c/{data.classId}/classwork" class="button faint">
              <IconBackArrow /> Back
            </a>
        </div>
        <div class="assignment-container-grid">
            <div class="assignment-details">
                <h1 class="h3">{data?.classData?.assignmentById?.title}</h1>
                <div class="description-container no-child-margin-top">{@html data?.classData?.assignmentById?.safeRenderedHtml}</div>
            </div>
            <div class="assignment-work">
                a
            </div>
        </div>
    </div>
</div>

