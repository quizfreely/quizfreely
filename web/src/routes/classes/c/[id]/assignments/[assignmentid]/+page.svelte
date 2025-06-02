<script>
    import AssignmentTeacherView from "./AssignmentTeacherView.svelte";
    import AssignmentStudentView from "./AssignmentStudentView.svelte";
    let { data } = $props();
    let amIATeacher = data?.classData?.classById?.teachers?.some(
        teacher => data?.authedUser?.id == teacher?.id
    );
</script>

{#if amIATeacher}
    <AssignmentTeacherView data={{ ...data, amIATeacher }}></AssignmentTeacherView>
{:else}
    <AssignmentStudentView data={{ ...data, amIATeacher }}></AssignmentStudentView>
{/if}

