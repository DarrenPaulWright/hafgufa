module.exports = [{
	type: 'css',
	files: []
}, {
	type: 'src',
	files: [
		'index.js',
		'src/**/*.js'
	]
}, {
	type: 'helper',
	files: [
		'tests/TestUtil.js',
		'tests/ExtendsTestRunner.js',
		'tests/extendsTestRegister.js',
		'tests/**/*Tests.js',
		'src/**/*.less'
	]
}, {
	type: 'specs',
	files: [
		'tests/**/*.test.js'
	]
}];
