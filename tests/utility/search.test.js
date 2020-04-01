import { assert } from 'type-enforcer';
import search from '../../src/utility/search';

describe('search', () => {
	const runTests = (data) => {
		data.tests.forEach((test) => {
			it(test.it, () => {
				const output = data.functionToTest(...test.args);
				assert.is(output, test.expected);
			});
		});
	};

	describe('.find', () => {
		runTests({
			functionToTest: search.find,
			tests: [{
				it: 'testValidInString1',
				args: ['a', 'apple'],
				expected: true
			}, {
				it: 'testValidInString2',
				args: ['A', 'apple'],
				expected: true
			}, {
				it: 'testValidInString3',
				args: ['a', 'Apple'],
				expected: true
			}, {
				it: 'testValidInString4',
				args: ['a p', 'Apple'],
				expected: true
			}, {
				it: 'testValidInString5',
				args: [' ', ' Apple'],
				expected: true
			}, {
				it: 'testValidInString6',
				args: ['app -el', 'Apple'],
				expected: true
			}, {
				it: 'testInvalidInString1',
				args: ['b', 'apple'],
				expected: false
			}, {
				it: 'testInvalidInString2',
				args: ['ae', 'apple'],
				expected: false
			}, {
				it: 'testInvalidInString3',
				args: ['b a', 'apple'],
				expected: false
			}, {
				it: 'testInvalidInString4',
				args: ['b', ''],
				expected: false
			}, {
				it: 'testInvalidInString5',
				args: ['app -pl', 'apple'],
				expected: false
			}, {
				it: 'test isEachInString OR 1',
				args: ['q OR app', 'apple'],
				expected: true
			}, {
				it: 'test isEachInString OR 2',
				args: ['q OR -app', 'apple'],
				expected: false
			}, {
				it: 'test isEachInString OR 3',
				args: ['app OR q', 'apple'],
				expected: true
			}, {
				it: 'test isEachInString OR 4',
				args: ['-app OR q', 'apple'],
				expected: false
			}]
		});
	});
});
