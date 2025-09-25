import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit()
	],
	server: {
		port: process?.env?.PORT ?? 8080,
		proxy: {
			"/api/": {
				target: process?.env?.API_URL ?? "http://localhost:8008",
				changeOrigin: true,
				rewrite: function (path) {
					return path.replace(/^\/api/, "");
				}
			},
			"/realtime/": {
				target: process?.env?.REALTIME_SERVER_URL ?? "http://localhost:8000",
				changeOrigin: true,
				rewrite: function (path) {
					return path.replace(/^\/realtime/, "");
				}
			},
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
				rewrite: function (path) {
					return path.replace(/^\/api/, "");
				}
			},
			"/realtime/": {
				target: process?.env?.REALTIME_SERVER_URL ?? "http://localhost:8000",
				changeOrigin: true,
				rewrite: function (path) {
					return path.replace(/^\/realtime/, "");
				}
			},
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
