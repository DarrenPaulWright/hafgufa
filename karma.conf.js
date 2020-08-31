const { karmaConfig } = require('karma-webpack-bundle');
const testRunnerConfig = require('./testRunner.config.js');

module.exports = karmaConfig(testRunnerConfig, {
	files: ['tests/index.js'],
	preprocessors: { 'tests/index.js': ['webpack'] },
	webpack: {
		mode: 'development',
		optimization: {
			splitChunks: {
				cacheGroups: {
					vendor: {
						test: /node_modules/u,
						name: 'vendor',
						maxSize: 244000,
						chunks: 'all'
					}
				}
			}
		},
		module: {
			rules: [{
				test: /\.less$/u,
				loader: 'null-loader'
			}, {
				test: /\.js$/u,
				enforce: 'pre',
				exclude: /node_modules/u,
				use: [{
					loader: 'eslint-loader',
					options: {
						cache: false,
						emitWarning: true,
						emitError: true
					}
				}]
			}, {
				test: /\.js/u,
				loader: 'babel-loader'
			}]
		},
		watch: false
	}
});
