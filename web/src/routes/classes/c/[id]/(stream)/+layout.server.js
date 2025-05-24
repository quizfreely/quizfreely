export async function load({ url }) {
	return {
		classesStreamTransPageKey: url.pathname,
	};
};
