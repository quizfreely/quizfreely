export async function load({ url }) {
	let backLink;
	let backSearchParam = url.searchParams.get("back")
	console.log(backSearchParam)
	let allowedLinkRegexes = [
		/^\/studysets\/[a-z0-9-]+\/review-mode\/settings$/,
		/^\/studyset\/local\/review-mode\/settings\?id=[0-9]+$/
	]
	if (backSearchParam != null) {
		var allowed = allowedLinkRegexes.some(
			function (regex) {
				return regex.test(backSearchParam)
			}
		)
		if (allowed) {
			backLink = backSearchParam;
		}
	}
	return {
		settingsTransPageKey: url.pathname,
		backLink: backLink
	};
};
