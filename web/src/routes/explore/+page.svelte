<script>
    import { onMount } from "svelte";
    let { data } = $props();
    let modPowersActive = $state(false);
    onMount(() => {
        if (data.authedUser?.modPerms) {
            modPowersActive = (localStorage.getItem("quizfreely:modPowersActive") == "true");
        }
    })
</script>

<svelte:head>
    <title>Explore & Search - Quizfreely</title>
    <meta name="description" content="Quizfreely is a free and open source learning app with flashcards, practice tests, and more tools to help you study." />
    <meta name=”robots” content="index, follow" />
</svelte:head>

<main>
  <div class="grid page">
    <div class="content">
      {#each data.featuredCategories as category}
      {#if (category.studysets?.length >= 1) }
      <h2 class="h4">{category.title}</h2>
      {#if modPowersActive}
        <p class="fg0">{category.id}</p>
      {/if}
      <div class="grid list" style="overflow-wrap:anywhere">
        {#each category.studysets as featuredStudyset }
          <div class="box">
            <a href="/studysets/{ featuredStudyset.id }">
              { featuredStudyset.title }
            </a>
            <p class="h6" style="margin-top:0.4rem;margin-bottom:0px">
              { featuredStudyset?.user?.displayName }
            </p>
            {#if (featuredStudyset.termsCount >= 1) }
            <p class="h6" style="margin-top:0.2rem;margin-bottom:0.2rem">
              { featuredStudyset.termsCount } Terms
            </p>
            {/if}
          </div>
        {/each}
      </div>
      {/if}
      {/each}
      {#if (data.recentStudysets?.length >= 1) }
      <h2 class="h4">Recently Created or Updated</h2>
        <div class="grid list" style="overflow-wrap:anywhere">
          {#each data.recentStudysets as studyset }
            <div class="box">
              <a href="/studysets/{ studyset.id }">
                { studyset.title }
              </a>
              <p class="h6" style="margin-top:0.4rem;margin-bottom:0px">
                { studyset?.user?.displayName }
              </p>
              {#if (studyset.termsCount >= 1) }
              <p class="h6" style="margin-top:0.2rem;margin-bottom:0.2rem">
                { studyset.termsCount } Terms
              </p>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</main>
