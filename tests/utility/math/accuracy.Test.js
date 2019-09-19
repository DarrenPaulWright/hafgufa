import { assert } from 'chai';
import { accuracy } from '../../../src';
import TestUtil from '../../TestUtil';

new TestUtil(accuracy);

describe('accuracy', () => {
	it('should return 2 for 3.14', () => {
		assert.equal(accuracy(3.14), 2);
	});
	it('should return 6 for 3.142345', () => {
		assert.equal(accuracy(3.142345), 6);
	});
	it('should return 0 for 142345', () => {
		assert.equal(accuracy(142345), 0);
	});
	it('should return 0 for NaN', () => {
		assert.equal(accuracy(NaN), 0);
	});
	it('should return 0 for Infinity', () => {
		assert.equal(accuracy(Infinity), 0);
	});
	it('should return 0 for -Infinity', () => {
		assert.equal(accuracy(-Infinity), 0);
	});
});
