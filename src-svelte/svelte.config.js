import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [
		preprocess({
			postcss: true
		})
	],

	kit: {
		vite: {
			optimizeDeps: {
				exclude: ['electron']
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
