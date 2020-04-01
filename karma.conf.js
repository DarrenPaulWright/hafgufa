const { karmaConfig } = require('karma-webpack-bundle');
const testRunnerConfig = require('./testRunner.config.js');

module.exports = karmaConfig(testRunnerConfig, {
	files: ['tests/index.js'],
	preprocessors: { 'tests/index.js': ['webpack'] }
});
