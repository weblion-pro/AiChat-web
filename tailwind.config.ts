
import { join } from 'path';
import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors'; // Add this line to import the 'colors' object

// 1. Import the Skeleton plugin
import { skeleton } from '@skeletonlabs/tw-plugin';

const config = {
	// 2. Opt for dark mode to be handled via the class method
	darkMode: 'class',
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		// 3. Append the path to the Skeleton package
		join(require.resolve(
			'@skeletonlabs/skeleton'),
			'../**/*.{html,js,svelte,ts}'
		)
	],
	theme: {
		extend: {
			colors: {
				"khoukhi": "#ef233c"
			},
			keyframes: {
			  slide: {
				"0%": { transform: "translate(-100%)" },
				"100%": { transform: "translate(0px)" },
			  },
			  slideinRight: {
				"0%": { transform: "translate(100%)" },
				"100%": { transform: "translate(0px)" },
			  },
			  slideDown: {
				"0%": { transform: "translateY(-100%)" },
				"100%": { transform: "translateY(0)" },
			  },
			  slideUp: {
				"0%": { transform: "translateY(100%)" },
				"100%": { transform: "translateY(0)" },
			  },
			},
			animation: {
			  slidein: "slide 0.2s ease-out",
			  slideOut: "slide 0.2s ease-in reverse",
			  slideinRight: "slideinRight 0.2s ease-out",
			  slideDown: "slideDown 0.2s ease-out",
			  slideUp: "slideUp 0.2s ease-out",
			},
		  },
	},
	plugins: [
		// 4. Append the Skeleton plugin (after other plugins)
		skeleton({
			themes: { preset: [ "vintage" ] }
		})
	]
} satisfies Config;

export default config;
						