import { sveltekit } from '@sveltejs/kit/vite';
import path from 'path';
import { defineConfig } from 'vitest/config';


export default defineConfig({
	plugins: [sveltekit()],
	resolve: {
		alias: {
			"@components": path.resolve("src/components"),
			"@controllers": path.resolve("src/controllers"),
			"@services": path.resolve("src/services"),
			"@data-types": path.resolve("src/types"),
		}
	},
	test: {
		environment: 'jsdom',
		globals: true
	}
});
