export async function load({ url, route }) {
	var transPageKey = url.pathname;
	/* This root layout has page transitions when transPageKey changes.
	We set transPageKey to the same thing for all pages under settings
	to avoid transitioning here because settings has its own page transitions. */
	if (transPageKey.startsWith("/settings")) {
		transPageKey = "/settings"
	// } else if (
	//        /* we also make transPageKey not change for stuff under `(stream)` in classes
	//        which we can check using route.id */
	//        transPageKey.startsWith("/classes/c/") && (
	//            route.id != null && // route.id is null on 404
	//            route.id.includes("(stream)")
	//        )
	//    ) {
	// 	transPageKey = "/classes/c/[id]/(stream)"
	}
	return {
		transPageKey: transPageKey 
	};
};

