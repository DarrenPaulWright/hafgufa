const singleRun = process.argv.includes('--single-run');

const reporters = ['mocha'];
if (singleRun) {
	reporters.push('coverage');
	reporters.push('coveralls');
}

module.exports = function(config) {
	config.set({
		frameworks: ['mocha'],
		browsers: ['ChromeHeadless', 'FirefoxHeadless'],
		customLaunchers: {
			FirefoxHeadless: {
				base: 'Firefox',
				flags: ['-headless']
			}
		},
		files: ['tests/index.js'],
		preprocessors: {
			'tests/index.js': ['webpack']
		},
		reporters: reporters,
		mochaReporter: {
			output: 'minimal',
			showDiff: true
		},
		coverageReporter: {
			type: 'lcov',
			dir: 'coverage/'
		},
		webpack: {
			mode: 'development',
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
					test: /\.less$/,
					loaders: ['null-loader']
				}, {
					test: /\.js$/,
					enforce: 'pre',
					exclude: /node_modules/,
					use: [{
						loader: 'eslint-loader',
						options: {
							configFile: '.eslintrc.json',
							cache: false,
							emitWarning: true
						}
					}]
				}, {
					test: /\.js/,
					exclude: /node_modules/,
					loader: 'babel-loader'
				}]
			},
			watch: true
		}
	});
};
