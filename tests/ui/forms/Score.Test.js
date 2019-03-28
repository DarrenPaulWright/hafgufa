import { assert } from 'chai';
import { Score } from '../../../src';
import TestUtil from '../../TestUtil';
import FormControlTests from './FormControlTests';

const testUtil = new TestUtil(Score);
const formControlTests = new FormControlTests(Score, testUtil);

describe('Score', () => {

	formControlTests.run();

	describe('Init', () => {
		it('should have a div with class "score-text"', () => {
			window.control = new Score({
				container: window.testContainer
			});

			assert.equal(document.querySelectorAll('div.score-text').length, 1);
		});
	});
});
