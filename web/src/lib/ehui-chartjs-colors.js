export function setEhuiChartColors(chartClass) {
    if (typeof document === "undefined") {
        console.error("(ehui-chartjs-colors) `document` is undefined. Only use setEhuiChartColors(Chart) in onMount");
        return;
    }

    const rootStyles = getComputedStyle(document.documentElement);
    chartClass.defaults.backgroundColor = rootStyles.getPropertyValue("--main").trim();
    chartClass.defaults.borderColor = rootStyles.getPropertyValue("--border").trim();
    chartClass.defaults.color = rootStyles.getPropertyValue("--fg-1").trim();
}
