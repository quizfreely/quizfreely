export default function(searchParams, searchParamName) { 
    let link;
	let param = searchParams.get(searchParamName)
	let allowedLinkRegexes = [
		/^\/studysets\/[a-z0-9-]+\/review-mode\/settings$/,
		/^\/studyset\/local\/review-mode\/settings\?id=[0-9]+$/
	]
	if (searchParam != null) {
		var allowed = allowedLinkRegexes.some(
			function (regex) {
				return regex.test(param)
			}
		)
		if (allowed) {
			link = param;
		}
	}
    return link;
}
