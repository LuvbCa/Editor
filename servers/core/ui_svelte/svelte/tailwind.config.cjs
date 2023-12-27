const colors = require('tailwindcss/colors');

// console.log(colors);

const config = {
	mode: 'jit',
	purge: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				gray: colors.blueGray
			},
			shadow: {
				colors
			},
			fontFamily: {
				poppins: ['Poppins']
			}
		}
	}
};

module.exports = config;
