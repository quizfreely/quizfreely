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
      {#if modPowersActive}
                <div class="flex" style="margin-bottom: 1rem;">
        <button class="alt yay"onclick={async () => {
            const title = prompt("title");
            const raw = await fetch("/api/graphql", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    query: `mutation newFeaturedCategory($title: String) {
    createFeaturedCategory(title: $title) {
        id
    }
}`,
                    variables: {
                        title
                    }
                })
            });
            const resp = await raw.json();
            console.log(resp);
            alert(resp?.data?.createFeaturedCategory?.id)
        }}>Create Featured Category</button>

        <button class="alt yay" onclick={async () => {
            const studysetId = prompt("studyset id");
            const categoryId = prompt("category id");
            const raw = await fetch("/api/graphql", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    query: `mutation setFeaturedCategory($studysetId: ID, $categoryId: ID) {
    setStudysetFeaturedCategory(studysetId: $studysetId, categoryId: $categoryId)
}`,
                    variables: {
                        studysetId,
                        categoryId
                    }
                })
            });
            const resp = await raw.json();
            console.log(resp);
        }}>Set Studyset Category</button>
    </div>
      {/if}
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
