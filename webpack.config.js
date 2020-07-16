const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ThemesPlugin = require('less-themes-webpack-plugin');
const WebpackMildCompile = require('webpack-mild-compile').Plugin;

const themeStructure = {
	include: 'light',
	light: {
		mobile: [],
		desktop: ['desktop']
	},
	dark: {
		include: 'dark',
		mobile: [],
		desktop: ['desktop']
	}
};

const config = {
	entry: {
		main: ['babel-polyfill', './src/toolkit/toolkit.js']
	},
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'src/[name].js',
		publicPath: '/'
	},
	optimization: {
		splitChunks: {
			cacheGroups: {
				vendor: {
					test: /[/\\]node_modules[/\\]/,
					name: 'vendor',
					chunks: 'all'
				}
			}
		}
	},
	stats: 'minimal',
	plugins: [
		new CopyWebpackPlugin([{
			context: './',
			from: 'images/**/*.*'
		}, {
			context: './',
			from: 'localization/*.json'
		}]),
		new HtmlWebpackPlugin({
			title: 'Hafgufa',
			minify: {
				collapseWhitespace: true
			},
			excludeAssets: [/.*desktop.js/, /.*mobile.js/]
		}),
		new ThemesPlugin({
			filename: 'styles/[name].min.css',
			themesPath: './src/themes',
			sourceMap: true,
			themes: {
				simple: {
					...themeStructure,
					path: 'simple'
				},
				electron: {
					...themeStructure,
					path: 'electron'
				},
				hud_01: {
					...themeStructure,
					path: 'hud_01'
				},
				moonBeam: {
					...themeStructure,
					path: 'moonBeam'
				},
				vintage: {
					...themeStructure,
					path: 'vintage'
				}
			}
		}),
		new WebpackMildCompile()
	],
	module: {
		rules: [{
			test: /\.js$/,
			enforce: 'pre',
			exclude: /node_modules/,
			use: [{
				loader: 'eslint-loader',
				options: {
					configFile: '.eslintrc.json',
					cache: true,
					emitWarning: true
				}
			}]
		}, {
			test: /\.js$/,
			exclude: /node_modules/,
			loader: 'babel-loader'
		}]
	}
};

module.exports = config;
