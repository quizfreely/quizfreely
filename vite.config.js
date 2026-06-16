import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';


export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");

    const proxy = {
        "/api/": {
            target: env?.API_URL ?? "http://localhost:8008",
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
            target: env?.REALTIME_SERVER_URL ?? "http://localhost:8000",
            changeOrigin: true,
            rewrite: function (path) {
                return path.replace(/^\/realtime/, "");
            }
        },
        "/usercontent/": {
            target: env?.USERCONTENT_URL ?? "http://usercontent.web.garage.localhost:3902",
            changeOrigin: true,
            rewrite: function (path) {
                return path.replace(/^\/usercontent/, "");
            }
        },
        ...(env?.ENABLE_UMAMI == "true" && env?.UMAMI_PROXY_TARGET_URL?.length > 0 ? {
            "/umami": {
                target: env?.UMAMI_PROXY_TARGET_URL
            }
        } : {})
        // "/classes/api/": {
        // 	target: env?.CLASSES_API_URL ?? "http://localhost:3000",
        // 	changeOrigin: true,
        // 	rewrite: function (path) {
        // 		return path.replace(/^\/classes\/api/, "");
        // 	}
        // }
    };

	return {
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
    };
});
