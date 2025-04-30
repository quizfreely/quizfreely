import safelyParseLinkSearchParam from '$lib/safelyParseLinkSearchParam.js';"$lib/safelyParseLinkSearchParam.js";
export async function load({ url }) {
	return {
		settingsTransPageKey: url.pathname,
		backLink: safelyParseLinkSearchParam(url.searchParams, "back")
	};
};
