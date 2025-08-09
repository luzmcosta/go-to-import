import { defineConfig } from '@vscode/test-cli';

export default defineConfig({
	files: 'out/test/minimal.test.js',
	mocha: {
		timeout: 5000,
		slow: 2000
	},
	launchArgs: [
		'--disable-extensions',
		'--disable-workspace-trust'
	]
});
