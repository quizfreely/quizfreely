<script>
    import Noscript from "$lib/components/Noscript.svelte";
    import { page } from "$app/state";
    import ProseMirrorEditor from "$lib/proseMirrorEditor.svelte";
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
</style>
<svelte:head>
    <title>Quizfreely Classes</title>
</svelte:head>

<Noscript />
<main>
    <div class="grid page">
        <div class="content">
            <ProseMirrorEditor />
            <h1 class="h3">{page.data?.classData?.classById?.name}</h1>
        <div class="layout-container">
            <div>
                <h4 class="center layout-title-show-on-mobile-only">Settings</h4>
                <div class="layout-menu-nav">
                    <a href="/classes/c/{ page.data?.classData?.classById?.id }" class="layout-menu-link {page.data?.streamPage == "stream" ? "current" : ""}">
                        Stream
                    </a>
                    <a href="/classes/c/{ page.data?.classData?.classById?.id }/classwork" class="layout-menu-link {page.data?.streamPage == "classwork" ? "current" : ""}">
                        Classwork
                    </a>
                    <a href="/classes/c/{ page.data?.classData?.classById?.id }/people" class="layout-menu-link {page.data?.streamPage == "people" ? "current" : ""}">
                        People
                    </a>
                    {#if amIATeacher}
                    <a href="/classes/c/{ page.data?.classData?.classById?.id }/settings" class="layout-menu-link {page.data?.streamPage == "settings" ? "current" : ""}">
                        Settings
                    </a>
                    {/if}
                </div>
                <div class="box">
                </div>
            </div>
            <div style="margin-top:0px">
                {#key data.settingsTransPageKey}
                    <div in:fade={{ duration: 140, delay: 140 }} out:fade={{ duration: 140 }}>
                        {@render children()}
                    </div>
                {/key}
            </div>
        </div>
            {#if amIATeacher}
                
            {/if}
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

