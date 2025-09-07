<script>
    import ReviewMode from "../../PracticeTest.svelte"
    let { data } = $props();
</script>

<ReviewMode data={{ ...data, local: false, alreadyOver: true }} />
