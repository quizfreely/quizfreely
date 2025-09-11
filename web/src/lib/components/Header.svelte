<script>
    import Searchbar from "$lib/components/Searchbar.svelte";
    import { page } from '$app/state';
    import { beforeNavigate } from "$app/navigation"
    import IconUser from "$lib/icons/User.svelte";
    import IconMenu from "$lib/icons/Menu.svelte";
    import IconCloseXMark from "$lib/icons/CloseXMark.svelte";

    beforeNavigate(function (navigation) {
      document.getElementById("nav-menu-toggle").checked = false
    })
</script>

<style>
.nav-menu > div {
  transition-duration: 0.4s;
}
.current {
  transition-duration: 0.4s;
}
.hide-on-mobile-for-compactness {
  margin-top: 0px;
}
@media only screen and (max-width: 800px) {
  .hide-on-mobile-for-compactness {
    display: none;
  }
}
</style>

<header class="navbar with-search with-status" style="margin-bottom: 0px;">
    <div class="menu">
        <input type="checkbox" id="nav-menu-toggle" class="nav-menu-toggle" />
        <label for="nav-menu-toggle" class="nav-menu-open">
            <IconMenu width="1.2rem" height="1.2rem" />
        </label>
        <label for="nav-menu-toggle" class="nav-menu-close">
            <IconCloseXMark width="1.4rem" height="1.4rem" />
        </label>
        <div class="nav-menu">
            <div class={
              (page.data?.header?.activePage == "home") ? "current" : ""
            }>
              <a href="/home">Home</a>
            </div>
            <div class={ page.data?.header?.activePage == "explore" ? "current" : "" }>
              <a href="/explore">Explore</a>
            </div>
            <!--<div class={ page.data?.header?.activePage == "classes" ? "current" : "" }>
              <a href="/classes">Classes</a>
            </div>-->
            <div class={ page.data?.header?.activePage == "settings" ? "current" : "" }>
              <a href="/settings">Settings</a>
            </div>
        </div>
    </div>
    {#if page.data?.header?.hideSearchbar }
        <div class="search"></div>
    {:else}
    <div class="search">
        <Searchbar query={page.data?.header?.searchQuery} />
    </div>
    {/if}
    <div class="status">
        {#if page.data?.authed }
            <!--<div class="dropdown" tabindex="0" style="margin-top:0px;margin-bottom:0px;margin-left:1rem;margin-right:1rem">
                {#if page.data.authedUser.display_name.length < 10 }
                    <button class="faint">
                      <IconUser />
                      { page.data.authedUser.display_name }
                    </button>
                {:else}
                    <button class="faint">
                      <IconUser />
                      Signed in
                    </button>
                {/if}
                <div class="content" style="right:0">
                  <a href="/users/{ page.data.authedUser.id }" class="button">Profile</a>
                  <a href="/settings" class="button">Settings</a>
                </div>
            </div>-->
            <div style="margin-top:0px;margin-bottom:0px;margin-left:0px;margin-right:1rem">
              {#if page.data.authedUser.displayName.length < 10 }
                  <a href="/settings/account" class="button faint">
                    <IconUser />
                    <span class="hide-on-mobile-for-compactness">{ page.data.authedUser.displayName }</span>
                  </a>
              {:else}
                  <a href="/settings/account" class="button faint">
                    <IconUser />
                    <span class="hide-on-mobile-for-compactness">Signed in</span>
                  </a>
              {/if}
            </div>
        {:else if page.data?.header?.showSignUpLink}
        <div class="flex" style="margin-top:0px;margin-bottom:0px;margin-left:1rem;margin-right:1rem">
          <a href="/sign-up" class="button alt">Sign up</a>
        </div>
        {:else}
        <div class="flex" style="margin-top:0px;margin-bottom:0px;margin-left:0px;margin-right:1rem">
          <a href="/sign-in" class="button alt">Sign in</a>
        </div>
        {/if}
    </div>
</header>
