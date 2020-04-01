import { assert } from 'type-enforcer';
import { Score } from '../..';
import TestUtil from '../TestUtil';
import FormControlTests from './FormControlTests';

describe('Score', () => {
	const testUtil = new TestUtil(Score);
	const formControlTests = new FormControlTests(Score, testUtil);

	formControlTests.run();

	describe('Init', () => {
		it('should have a div with class "score-text"', () => {
			testUtil.control = new Score({
				container: testUtil.container
			});

			assert.is(testUtil.count('div.score-text'), 1);
		});
	});
});
