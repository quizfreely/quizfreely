export default function(searchParams, searchParamName) { 
    let link;
	let param = searchParams.get(searchParamName)
	let allowedLinkRegexes = [
		/^\/studysets\/[a-z0-9-]+\/settings$/,
		/^\/studyset\/local\/settings\?id=[0-9]+$/,
		/^\/studysets\/[a-z0-9-]+\/review-mode$/,
		/^\/studyset\/local\/review-mode\?id=[0-9]+$/
	]
	if (param != null) {
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
