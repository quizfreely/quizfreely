export async function load({ url }) {
	var transPageKey = url.pathname;
	/* This root layout has page transitions when transPageKey changes.
	We set transPageKey to the same thing for all pages under settings
	to avoid transitioning here because settings has its own page transitions. */
	if (transPageKey.startsWith("/settings")) {
		transPageKey = "/settings"
	}
	return {
		transPageKey: transPageKey 
	};
};
