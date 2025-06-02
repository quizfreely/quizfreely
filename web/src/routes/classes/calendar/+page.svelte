<script>
    import {Calendar, DayGrid, List, TimeGrid} from '@event-calendar/core';
    let { data } = $props();

    let options = $state({
        view: 'timeGridWeek',
        events: [
            (() => {
                if (data?.classData?.allAssignmentsAsStudent?.length > 0) {
                    let eventsArray = [];
                }
            })
        ],
        headerToolbar: {
            start: 'prev,next today',
            center: 'title',
            end: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
        },
        buttonText: {
            close: 'Close',
            dayGridMonth: 'Month',
            listDay: 'List',
            listMonth: 'List',
            listWeek: 'List',
            listYear: 'List',
            resourceTimeGridDay: 'resources',
            resourceTimeGridWeek: 'resources',
            resourceTimelineDay: 'timeline',
            resourceTimelineMonth: 'timeline',
            resourceTimelineWeek: 'timeline',
            timeGridDay: 'Day',
            timeGridWeek: 'Week',
            today: 'Today'
        }
    });
</script>
<style>
    :global {
        .thecontainer {
            max-width: 80vw;
        }
        .ec-title {
            font-size: 1.6rem;
            font-weight: normal;
        }
    }
</style>
<div class="grid page">
    <div class="content thecontainer no-child-margin-top {
    data.theme == "auto" ?
        "ec-auto-dark" :
        data.theme == "dark" ?
            "ec-dark" :
            ""
}">
<Calendar plugins={[DayGrid, List, TimeGrid]} {options} />
    </div>
</div>
