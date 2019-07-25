import { assert } from 'chai';
import { round } from '../../../src/';

describe('round', () => {
	const tests = [{
		input: 3.14159265358979,
		precision: 3,
		output: 3.142
	}, {
		input: 3.14159265358979,
		precision: 0,
		output: 3
	}, {
		input: 3.14159265358979,
		precision: 8,
		output: 3.14159265
	}, {
		input: 3.14159265358979,
		precision: 20,
		output: 3.14159265358979
	}, {
		input: 20,
		precision: 20,
		output: 20
	}];

	tests.forEach((test) => {
		it(`should return ${test.output} when given ${test.input} and precision ${test.precision}`, () => {
			assert.equal(round(test.input, test.precision), test.output);
		});
	});
});
