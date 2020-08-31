import { assert } from 'type-enforcer';
import { Score } from '../../index.js';
import TestUtil from '../TestUtil.js';

describe('Score', () => {
	const testUtil = new TestUtil(Score);
	testUtil.run({
		skipTests: ['FocusMixin'],
		mainClass: 'score'
	});

	describe('Init', () => {
		it('should have a div with class "score-text"', () => {
			testUtil.control = new Score({
				container: testUtil.container
			});

			assert.is(testUtil.count('div.score-text'), 1);
		});
	});
});
