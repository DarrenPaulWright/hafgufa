const merge = require('webpack-merge');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const OfflinePlugin = require('offline-plugin');
const config = require('./webpack.config');

module.exports = merge(config, {
	mode: 'production',
	devtool: 'source-map',
	optimization: {
		minimizer: [
			new UglifyJsPlugin({
				parallel: true,
				sourceMap: true
			}),
			new OptimizeCssAssetsPlugin({
				assetNameRegExp: /\.min\.css$/g,
				cssProcessor: require('cssnano'),
				cssProcessorOptions: {
					preset: 'default',
					cssDeclarationSorter: false
				},
				canPrint: true
			})
		]
	},
	plugins: [
		new CleanWebpackPlugin(['dist']),
		new OfflinePlugin({
			appShell: '/'
		})
	]
});
