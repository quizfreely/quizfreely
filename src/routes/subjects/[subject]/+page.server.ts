import { error } from '@sveltejs/kit';

export async function load({ params, locals, url }) {
  try {
    const PER_PAGE = 24;
    const after = url.searchParams.get("after");
    const before = url.searchParams.get("before");

    const data = await locals.sdk.SubjectPage({
      id: params.subject,
      first: before ? null : PER_PAGE,
      last: before ? PER_PAGE : null,
      after,
      before
    });

    let authed = false;
    let authedUser;
    if (data.authed) {
      authed = data.authed;
      authedUser = data.authedUser;
    }

    const rawSubject = data.subject;
    const subject = rawSubject
      ? {
        ...rawSubject,
        studysets: rawSubject.studysets?.edges?.map((e: any) => e.node) ?? [],
        pageInfo: rawSubject.studysets?.pageInfo
      }
      : null;

    return {
      subject,
      authed: authed,
      authedUser: authedUser,
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
    });
  }
}
