<script>
    import {Calendar, TimeGrid} from '@event-calendar/core';
    let { data } = $props();

    let options = $state({
        view: 'timeGridWeek',
        events: [
            // your list of events
        ]
    });
</script>
<div class={
    data.theme == "auto" ?
        "ec-auto-dark" :
        data.theme == "dark" ?
            "ec-dark" :
            ""
}>
<Calendar plugins={[TimeGrid]} {options} />
</div>
