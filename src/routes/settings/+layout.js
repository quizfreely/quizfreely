export async function load({ url }) {
	return {
		settingsTransPageKey: url.pathname,
	};
};
