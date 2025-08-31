<script>
    import { onMount } from "svelte";
    import Chart from 'chart.js/auto';
    import { setEhuiChartColors } from "$lib/ehui-chartjs-colors.js";
    let chartCanvas;
    onMount(() => {
        setEhuiChartColors(Chart);
        // new Chart(
        //     chartCanvas,
        //     {
        //         type: "line",
        //         data: {
        //             labels: ["a", "b", "c"],
        //             dataset: {
        //                 fill: false,
        //                 tension: 0
        //             }
        //         }
        //     }
        // )
    })
</script>
<canvas bind:this={chartCanvas}></canvas>
