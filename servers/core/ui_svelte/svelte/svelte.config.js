import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [
		preprocess({
			postcss: true
		})
	],

	kit: {
		adapter: adapter(),
		vite: {
			optimizeDeps: {
				exclude: ['electron'],
				include: ['highlight.js/lib/core']
			},
			esbuild: {
				exclude: ['electron']
			}
		},
		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte',
		ssr: false,
		prerender: {
			enabled: false
		}
	}
};

export default config;
