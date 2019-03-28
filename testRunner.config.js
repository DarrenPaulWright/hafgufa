module.exports = [{
	type: 'css',
	files: []
}, {
	type: 'src',
	files: [
		'src/**/*.js'
	]
}, {
	type: 'helper',
	files: [
		'tests/TestUtil.js',
		'tests/query.js',
		'tests/**/*Tests.js',
		'src/**/*.less'
	]
}, {
	type: 'specs',
	files: [
		'tests/**/*.Test.js'
	]
}];
