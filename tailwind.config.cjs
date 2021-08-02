module.exports = {
	purge: {
		content: ['./src/**/*.{svelte, js, ts, html}'],
		options: {
			enabled: true,
			defaultExtractor: (content) => [
				...(content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || []),
				...(content.match(/(?<=class:)[^=>\/\s]*/g) || [])
			]
		}
	},
	darkMode: false, // or 'media' or 'class'
	theme: {
		extend: {}
	},
	variants: {
		extend: {}
	},
	plugins: []
};
