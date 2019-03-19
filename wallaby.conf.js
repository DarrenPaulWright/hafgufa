const wallabyWebpack = require('wallaby-webpack');
const testRunnerConfig = require('test-runner-config');
const config = require('./testRunner.config.js');

const files = testRunnerConfig.getWallabyFiles(config, {
	css: (file) => ({pattern: file, instrument: false, load: true}),
	helper: (file) => ({pattern: file, instrument: false, load: false}),
	src: (file) => ({pattern: file, instrument: true, load: false}),
	specs: (file) => ({pattern: file, instrument: false, load: false})
});

module.exports = function(wallaby) {
	const webpackPostprocessor = wallabyWebpack({
		optimization: {
			splitChunks: {
				cacheGroups: {
					vendor: {
						test: /[\\/]node_modules[\\/]/,
						name: 'vendor',
						maxSize: 244000,
						chunks: 'all'
					}
				}
			}
		},
		module: {
			rules: [{
				test: /\.less$/, loaders: ['null-loader']
			}, {
				test: /\.js/,
				exclude: /node_modules/,
				loader: 'babel-loader'
			}]
		}
	});

	return {
		name: 'Hafgufa',
		files: files.files,
		tests: files.tests,
		testFramework: 'mocha',
		env: {
			kind: 'chrome'
		},
		postprocessor: webpackPostprocessor,
		compilers: {
			'**/*.js': wallaby.compilers.babel()
		},
		setup: function() {
			window.__moduleBundler.loadTests();
		},
		// debug: true,
		lowCoverageThreshold: 99
	};
};
