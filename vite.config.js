import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

const proxy = {
    "/api/": {
        target: process?.env?.API_URL ?? "http://localhost:8008",
        changeOrigin: true,
        rewrite: function (path) {
            return path.replace(/^\/api/, "");
        },
        configure: (proxy, _options) => {
            proxy.on("proxyRes", (proxyRes, req, res) => {
                const setCookie = proxyRes.headers['set-cookie'];
                if (setCookie) {
                    const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
                        
                    proxyRes.headers["set-cookie"] = cookies.map(
                        cookie => cookie.replace(/;\s*Secure/gi, "")
                    );
                }
            });
        }
    },
    "/realtime/": {
        target: process?.env?.REALTIME_SERVER_URL ?? "http://localhost:8000",
        changeOrigin: true,
        rewrite: function (path) {
            return path.replace(/^\/realtime/, "");
        }
    },
    "/usercontent/": {
        target: process?.env?.USERCONTENT_URL ?? "http://usercontent.web.garage.localhost:3902",
        changeOrigin: true,
        rewrite: function (path) {
            return path.replace(/^\/usercontent/, "");
        }
    },
    // "/classes/api/": {
    // 	target: process?.env?.CLASSES_API_URL ?? "http://localhost:3000",
    // 	changeOrigin: true,
    // 	rewrite: function (path) {
    // 		return path.replace(/^\/classes\/api/, "");
    // 	}
    // }
};

export default defineConfig({
	plugins: [
		sveltekit()
	],
	server: {
		port: process?.env?.PORT ?? 8080,
        proxy
	},
	preview: {
		port: process?.env?.PORT ?? 8080,
		proxy
    }
});
