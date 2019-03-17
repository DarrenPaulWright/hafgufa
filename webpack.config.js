const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ThemesPlugin = require('less-themes-webpack-plugin');
const WebpackMildCompile = require('webpack-mild-compile').Plugin;

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
					test: /[\\/]node_modules[\\/]/,
					name: 'vendor',
					chunks: 'all'
				}
			}
		}
	},
	stats: 'minimal',
	plugins: [
		new CopyWebpackPlugin([
			{
				context: './',
				from: 'images/**/*.*'
			},
			{
				context: './',
				from: 'localization/*.json'
			}
		]),
		new HtmlWebpackPlugin({
			title: 'Hafgufa',
			minify: {
				collapseWhitespace: true
			},
			excludeAssets: [/.*desktop.js/, /.*mobile.js/]
		}),
		new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
		new ThemesPlugin({
			filename: 'styles/[name].min.css',
			themesPath: './src/ui/themes',
			sourceMap: true,
			themes: {
				simple: {
					light: {
						mobile: [
							'simple/light.less'
						],
						desktop: [
							'simple/light.less',
							'simple/desktop.less'
						]
					},
					dark: {
						mobile: [
							'simple/light.less',
							'simple/dark.less'
						],
						desktop: [
							'simple/light.less',
							'simple/dark.less',
							'simple/desktop.less'
						]
					}
				},
				electron: {
					light: {
						mobile: [
							'electron/light.less'
						],
						desktop: [
							'electron/light.less',
							'electron/desktop.less'
						]
					},
					dark: {
						mobile: [
							'electron/light.less',
							'electron/dark.less'
						],
						desktop: [
							'electron/light.less',
							'electron/dark.less',
							'electron/desktop.less'
						]
					}
				},
				hud_01: {
					light: {
						mobile: [
							'hud_01/light.less'
						],
						desktop: [
							'hud_01/light.less',
							'hud_01/desktop.less'
						]
					},
					dark: {
						mobile: [
							'hud_01/light.less',
							'hud_01/dark.less'
						],
						desktop: [
							'hud_01/light.less',
							'hud_01/dark.less',
							'hud_01/desktop.less'
						]
					}
				},
				moonBeam: {
					light: {
						mobile: [
							'moonBeam/light.less'
						],
						desktop: [
							'moonBeam/light.less',
							'moonBeam/desktop.less'
						]
					},
					dark: {
						mobile: [
							'moonBeam/light.less',
							'moonBeam/dark.less'
						],
						desktop: [
							'moonBeam/light.less',
							'moonBeam/dark.less',
							'moonBeam/desktop.less'
						]
					}
				},
				vintage: {
					light: {
						mobile: [
							'vintage/light.less'
						],
						desktop: [
							'vintage/light.less',
							'vintage/desktop.less'
						]
					},
					dark: {
						mobile: [
							'vintage/light.less',
							'vintage/dark.less'
						],
						desktop: [
							'vintage/light.less',
							'vintage/dark.less',
							'vintage/desktop.less'
						]
					}
				},
				cigar: {
					claro: {
						mobile: [
							'cigar/claro.less'
						],
						desktop: [
							'cigar/claro.less',
							'cigar/desktop.less'
						]
					},
					maduro: {
						mobile: [
							'cigar/claro.less',
							'cigar/maduro.less'
						],
						desktop: [
							'cigar/claro.less',
							'cigar/maduro.less',
							'cigar/desktop.less'
						]
					}
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
			use: [
				{
					loader: 'eslint-loader',
					options: {
						configFile: '.eslintrc.json',
						cache: true,
						emitWarning: true
					}
				}
			]
		}, {
			test: /\.js$/,
			exclude: /node_modules/,
			loader: 'babel-loader'
		}]
	}
};

module.exports = config;
