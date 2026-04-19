<script>
    import PracticeTest from "../../PracticeTest.svelte"
    let { data } = $props();
</script>

<PracticeTest data={{ ...data, local: false, alreadyOver: true }} />
