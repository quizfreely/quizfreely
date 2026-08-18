import { error } from '@sveltejs/kit';

export async function load({ params, fetch }) {
    const categoryEnum = {
        "languages": "LANG",
        "social-studies": "SOCIAL_STUDIES",
        "stem": "STEM",
        "math": "MATH",
        "language-arts": "LA"
    }?.[params.category];
    if (categoryEnum == null) {
        error(404, {
          message: "Not Found"
        });
        return;
    }
      try {
        let rawApiRes = await fetch("/api/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            query: `query subjectCategory($category: SubjectCategory) {
              authed
              authedUser {
                id
                username
                displayName
              }
              subjectsByCategory(category: $category) {
                id,
                name
              }
            }`,
            variables: {
              category: categoryEnum
            }
          })
        })
        let apiRes = await rawApiRes.json();
        let authed = false;
          let authedUser;
          if (apiRes?.data?.authed) {
            authed = apiRes.data.authed;
            authedUser = apiRes.data?.authedUser;
          }
          if (apiRes?.data) {
            return {
              subjects: apiRes.data?.subjectsByCategory,
              authed: authed,
              authedUser: authedUser,
              categoryEnum,
              header: {
                activePage: "explore"
              }
            }
          } else {
            console.error(
                "API Error in subject category page load func: ",
                apiRes
            );
            error(404, {
              message: "Not Found"
            })
          }
      } catch (err) {
        console.error(
            "Error in subject category page load func: ",
            err
        );
        error(404, {
          message: "Not Found"
        })
      }
}
