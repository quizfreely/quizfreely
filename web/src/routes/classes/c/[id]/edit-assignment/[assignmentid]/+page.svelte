<script>
    import EditAssignment from "../../EditAssignment.svelte";
    let { data } = $props();
</script>

<EditAssignment data={{ ...data, new: false, draft: false }}/>

