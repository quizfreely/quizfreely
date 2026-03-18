import { error } from '@sveltejs/kit';
import { SubjectCategory } from '$lib/graphql/generated';

export async function load({ params, locals }) {
    const categoryEnum: SubjectCategory | undefined = ({
        "languages": SubjectCategory.Lang,
        "social-studies": SubjectCategory.SocialStudies,
        "stem": SubjectCategory.Stem,
        "math": SubjectCategory.Math,
        "language-arts": SubjectCategory.La
    } as Record<string, SubjectCategory>)?.[params.category];

    if (categoryEnum == null) {
        error(404, {
          message: "Not Found"
        });
    }

    try {
        const data = await locals.sdk.SubjectCategory({
          category: categoryEnum
        });

        let authed = false;
        let authedUser;
        if (data.authed) {
          authed = data.authed;
          authedUser = data.authedUser;
        }

        return {
          subjects: data.subjectsByCategory,
          authed: authed,
          authedUser: authedUser,
          categoryEnum,
          header: {
            activePage: "explore"
          }
        };
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
