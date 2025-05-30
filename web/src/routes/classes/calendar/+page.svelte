<script>
    import {Calendar, TimeGrid} from '@event-calendar/core';

    let options = $state({
        view: 'timeGridWeek',
        events: [
            // your list of events
        ]
    });
</script>

<Calendar plugins={[TimeGrid]} {options} />
