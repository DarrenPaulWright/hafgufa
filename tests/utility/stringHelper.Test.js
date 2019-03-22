import { assert } from 'chai';
import stringHelper from '../../src/utility/stringHelper';
import TestUtil from '../TestUtil';

new TestUtil(stringHelper);

describe('stringHelper', () => {
	const runTests = (data) => {
		for (let index = 0; index < data.tests.length; index++) {
			it(data.tests[index].it, () => {
				const output = data.functionToTest.apply(null, data.tests[index].args);
				assert.equal(output, data.tests[index].expected);
			});
		}
	};

	describe('.isEachInString', () => {
		runTests({
			functionToTest: stringHelper.isEachInString,
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

	describe('.cleanJSON', () => {
		runTests({
			functionToTest: stringHelper.cleanJson,
			tests: [{
				it: 'should remove newlines from valid JSON',
				args: ['{"testKey1":\n"asdf"}'],
				expected: '{"testKey1":"asdf"}'
			}, {
				it: 'should remove spaces from both sides of braces from valid JSON',
				args: [' { "testKey1":"asdf" } '],
				expected: '{"testKey1":"asdf"}'
			}, {
				it: 'should remove spaces from either side of braces from valid JSON',
				args: ['{ "testKey1": {"testKey2":"asdf"} }'],
				expected: '{"testKey1":{"testKey2":"asdf"}}'
			}, {
				it: 'should remove spaces from both sides of colons from valid JSON',
				args: ['{"testKey1" : {"testKey2" : "asdf"}}'],
				expected: '{"testKey1":{"testKey2":"asdf"}}'
			}, {
				it: 'should remove spaces from either side of colons from valid JSON',
				args: ['{"testKey1" :{"testKey2": "asdf"}}'],
				expected: '{"testKey1":{"testKey2":"asdf"}}'
			}, {
				it: 'should remove spaces from both sides of commas from valid JSON',
				args: ['{"testKey1" : {"testKey2" : "asdf"} , "testKey3":"qwerty" , "testKey4":"something"}'],
				expected: '{"testKey1":{"testKey2":"asdf"},"testKey3":"qwerty","testKey4":"something"}'
			}, {
				it: 'should remove spaces from either side of commas from valid JSON',
				args: ['{"testKey1":{"testKey2" : "asdf"}, "testKey3":"qwerty" ,"testKey4":"something"}'],
				expected: '{"testKey1":{"testKey2":"asdf"},"testKey3":"qwerty","testKey4":"something"}'
			}]
		});
	});

	describe('.isValidJSON', () => {
		it('should return true for valid JSON', () => {
			const validJSON = '{"testKey1": "asdf"}';

			assert.isOk(stringHelper.isValidJson(validJSON));
		});

		it('should return false for invalid JSON', () => {
			const invalidJSON = '{testKey1: "asdf"}';

			assert.isNotTrue(stringHelper.isValidJson(invalidJSON));
		});
	});

	describe('.beautifyJson', () => {
		it('should return JSON formatted for human readability', () => {
			const cleanJSON = '{"testKey1":{"testKey2":"asdf"},"testKey3":"qwerty","testKey4":"something"}';
			const beautifiedJSON = '{\n    "testKey1": {\n        "testKey2": "asdf"\n    },\n    "testKey3": "qwerty",\n    "testKey4": "something"\n}';

			assert.equal(stringHelper.beautifyJson(cleanJSON), beautifiedJSON);
		});
	});
});
