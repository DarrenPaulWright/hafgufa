import { assert } from 'chai';
import { Score } from '../../../src';
import TestUtil from '../../TestUtil';
import FormControlBaseTests from './FormControlBaseTests';

const testUtil = new TestUtil(Score);
const formControlBaseTests = new FormControlBaseTests(Score, testUtil);

describe('Score', () => {

	formControlBaseTests.run();

	describe('Init', () => {
		it('should have a div with class "score-text"', () => {
			window.control = new Score({
				container: window.testContainer
			});

			assert.equal(document.querySelectorAll('div.score-text').length, 1);
		});
	});
});
