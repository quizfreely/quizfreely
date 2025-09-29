<script>
    let {
        data,
        cloudLinkTemplateFunc,
        localLinkTemplateFunc,
        cloudEmptyMsg,
        localEmptyMsg
    } = $props();

    import { fancyTimestamp } from "$lib/fancyTimestamp";
    import db from "$lib/idb-api-layer/db.js";
    import { onMount } from "svelte";

    import IconPlus from "$lib/icons/Plus.svelte";

    onMount(async function () {
        if (data?.settingsDateTimeFormatHours == "24") {
            fancyTimestamp.hours = 24;
        } else if (data?.settingsDateTimeFormatHours == "12") {
            fancyTimestamp.hours = 12;
        }

        if (data.authed) {
            for (var i = 0; i < document.getElementById("studyset-list").children.length; i++) {
                var timestampElement = document.getElementById("studyset-list").children[i].children[1]
                if (timestampElement) {
                  timestampElement.innerText = fancyTimestamp.format(timestampElement.dataset.timestamp);
                }
            }
        }

        const studysets = await db.studysets.orderBy("updatedAt").toArray();
        if (studysets.length >= 1) {
            var localListTitleElement = document.getElementById("local-list-title");
            if (localListTitleElement) {
                localListTitleElement.classList.remove("hide");
            }
            document.getElementById("local-list").classList.remove("hide");
            studysets.sort(function (a, b) {
                return Date.parse(b.updatedAt) - Date.parse(a.updatedAt)
            })
            for (var i = 0; i < studysets.length; i++) {
                var div = document.createElement("div");
                div.classList.add("box");
                var title = document.createElement("a");
                title.innerText = studysets[i].title;
                title.href = localLinkTemplateFunc(studysets[i].id);
                div.appendChild(title);
                if (studysets[i].updatedAt) {
                    var timestamp = document.createElement("p");
                    timestamp.classList.add("h6");
                    timestamp.innerText = fancyTimestamp.format(studysets[i].updatedAt);
                    div.appendChild(timestamp);
                }
                document.getElementById("local-list").appendChild(div);
            }
        } else {
            var emptyMessageElement = document.getElementById("local-list-empty");
            if (emptyMessageElement) {
                document.getElementById("local-list").classList.remove("hide");
                emptyMessageElement.classList.remove("hide");
            }
        }
    })
</script>

<div>
    {#if data.authed}
        <div class="grid list" id="studyset-list" style="overflow-wrap:anywhere">
            {#if data.studysetList && data.studysetList.length > 0}
                {#each data.studysetList as studyset}
                    <div class="box">
                        <a href={cloudLinkTemplateFunc(studyset.id)}>{ studyset.title }</a>
                        <p class="h6" data-timestamp={ studyset.updatedAt }>...</p>
                    </div>
                {/each}
            {:else}
                {@render cloudEmptyMsg}
            {/if}
        </div>
    {/if}
    {#if data.authed}
        <!-- only show "Local Studysets" title to tell the difference from studysets saved to an account when logged in -->
        <!-- also, the element has class="... hide" cause client/browser js only shows it if there are local studysets and the user is signed in -->
        <p class="h4 hide" id="local-list-title">Local Studysets</p>
    {/if}
    <div class="grid list hide" id="local-list">
        {#if !data.authed}
            <!-- only show empty message if user is logged out and can therefore only have local studysets -->
            {@render localEmptyMsg}
        {/if}
    </div>
</div>
