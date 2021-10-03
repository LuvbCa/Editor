const colors = require('tailwindcss/colors');

// console.log(colors);

const config = {
	mode: 'jit',
	purge: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			shadow: {
				colors
			}
		}
	}
};

module.exports = config;
