export async function load({ url }) {
	return {
		exploreTransPageKey: url.pathname,
	};
};
