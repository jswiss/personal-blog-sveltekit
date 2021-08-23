import { mdsvex } from 'mdsvex';
import netlify from '@sveltejs/adapter-netlify';
import preprocess from 'svelte-preprocess';
import { mdsvexConfig } from './mdsvex.config.js';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', ...mdsvexConfig.extensions],
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: [mdsvex(mdsvexConfig), preprocess()],

	kit: {
		// hydrate the <div id="svelte"> element in src/app.html
		adapter: netlify(),
		target: '#svelte',
		prerender: {
			force: true
		}
	}
};

export default config;
