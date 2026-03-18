export async function load({ url }) {
	return {
		dashboardTransPageKey: url.pathname,
	};
};
