<script>
    import { fade } from "svelte/transition";
    import Noscript from "$lib/components/Noscript.svelte";
    import IconPlus from "$lib/icons/Plus.svelte";
    import IconBackArrow from "$lib/icons/BackArrow.svelte";
    import { page } from "$app/state";
    let { children, data } = $props();

    let amIATeacher = page.data?.classData?.classById?.teachers?.some(
        teacher => page.data?.authedUser?.id == teacher?.id
    );
</script>
<style>
.class-box {
    display: flex;
    gap: 0px;
    border-radius: 0.8rem;
}
.class-link {
    color: var(--fg1);
}
.class-link:hover {
    color: var(--fg0);
}
/* from web/src/routes/settings/+layout.svelte */
    .layout-container {
        display: grid;
        gap: 1rem;
        grid-template-columns: 1fr 4fr;
        grid-template-rows: 1fr;
    }
    .layout-menu-link {
        margin-top: 0px;
        color: var(--fg1);
        padding: 0.4rem 0.8rem;
        border-radius: 0.8rem;
    }
    .layout-menu-link:hover {
        background-color: var(--bg3);
    }
    .layout-menu-link.current {
        color: var(--main);
        background-color: var(--bg3);
    }
    .layout-menu-link.current:hover {
        color: var(--main-alt);
    }
    .layout-menu-nav {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
        align-items: stretch;
    }
    .layout-title-show-on-mobile-only {
        display: none;
    }
    @media only screen and (max-width: 800px) {
        .layout-container {
            grid-template-columns: 1fr;
            grid-template-rows: auto 1fr;
        }
        .layout-menu-nav {
            flex-direction: row;
            gap: 1rem;
            margin-bottom: 1rem;
            align-items: center;
        }
        .layout-title-show-on-mobile-only {
            display: block;
        }
    }

    .container-main-content,
    .container-main-content-child {
        max-width: 100%;
        overflow-wrap: break-word;
        word-break: break-word;
    }
    .container-main-content {
        padding-right: 16vw;
    }
    @media only screen and (max-width: 1400px) {
        .container-main-content {
            padding-right: 0px;
        }
    }
</style>
<svelte:head>
    <title>Quizfreely Classes</title>
</svelte:head>

<Noscript />
<main>
    <div class="grid page">
        <div class="content">
            <div>
                <a href="/classes" class="button faint">
                  <IconBackArrow /> All classes
                </a>
            </div>
            <h1 class="h3" style="margin-top: 1rem;">{page.data?.classData?.classById?.name}</h1>
        <div class="layout-container">
            <div>
                <div class="layout-menu-nav">
                    <a href="/classes/c/{ page.data?.classId }" class="layout-menu-link {page.data?.streamPage == "stream" ? "current" : ""}">
                        Stream
                    </a>
                    <a href="/classes/c/{ page.data?.classId }/classwork" class="layout-menu-link {page.data?.streamPage == "classwork" ? "current" : ""}">
                        Classwork
                    </a>
                    <a href="/classes/c/{ page.data?.classId }/people" class="layout-menu-link {page.data?.streamPage == "people" ? "current" : ""}">
                        People
                    </a>
                    {#if amIATeacher}
                    <a href="/classes/c/{ page.data?.classId }/settings" class="layout-menu-link {page.data?.streamPage == "settings" ? "current" : ""}">
                        Settings
                    </a>
                    {/if}
                </div>
                {#if !amIATeacher}
                <div class="box">
                </div>
                {/if}
            </div>
            <div style="margin-top:0px" class="container-main-content">
                <div class="flex">
                    <a href="/classes/c/{ page?.data?.classId }/create-assignment" class="button alt"><IconPlus></IconPlus> Create assignment</a>
                </div>
                {#key data.classesStreamTransPageKey}
                    <div class="container-main-content-child" in:fade={{ duration: 140, delay: 140 }} out:fade={{ duration: 140 }}>
                        {@render children()}
                    </div>
                {/key}
            </div>
        </div>
            <p style="white-space: pre">
            {JSON.stringify(
                data.classData,
                null,
                4
            )}
            </p>
        </div>
    </div>
</main>

