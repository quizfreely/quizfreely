import devtoolsJson from "vite-plugin-devtools-json";
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit(), devtoolsJson()],
	server: {
		port: process?.env?.PORT ?? 8080,
		proxy: {
			"/api/": {
				target: process?.env?.API_URL ?? "http://localhost:8008",
				changeOrigin: true,
				rewrite(path) {
					return path.replace(/^\/api/, "");
				}
			},
			"/realtime/": {
				target: process?.env?.REALTIME_SERVER_URL ?? "http://localhost:8000",
				changeOrigin: true,
				rewrite(path) {
					return path.replace(/^\/realtime/, "");
				}
			},
			"/usercontent/": {
				target: process?.env?.USERCONTENT_URL ?? "http://usercontent.web.garage.localhost:3902",
				changeOrigin: true,
				rewrite(path) {
					return path.replace(/^\/usercontent/, "");
				}
			}

			// "/classes/api/": {
			// 	target: process?.env?.CLASSES_API_URL ?? "http://localhost:3000",
			// 	changeOrigin: true,
			// 	rewrite: function (path) {
			// 		return path.replace(/^\/classes\/api/, "");
			// 	}
			// }
		}
	},
	preview: {
		port: process?.env?.PORT ?? 8080,
		proxy: {
			"/api/": {
				target: process?.env?.API_URL ?? "http://localhost:8008",
				changeOrigin: true,
				rewrite(path) {
					return path.replace(/^\/api/, "");
				}
			},
			"/realtime/": {
				target: process?.env?.REALTIME_SERVER_URL ?? "http://localhost:8000",
				changeOrigin: true,
				rewrite(path) {
					return path.replace(/^\/realtime/, "");
				}
			},
			"/usercontent/": {
				target: process?.env?.USERCONTENT_URL ?? "http://usercontent.web.garage.localhost:3902",
				changeOrigin: true,
				rewrite(path) {
					return path.replace(/^\/usercontent/, "");
				}
			}

			// "/classes/api/": {
			// 	target: process?.env?.CLASSES_API_URL ?? "http://localhost:8008",
			// 	changeOrigin: true,
			// 	rewrite: function (path) {
			// 		return path.replace(/^\/classes\/api/, "");
			// 	}
			// }
		}
	}
});
