import { assert } from 'type-enforcer';
import { DragContainer } from '../../index.js';
import TestUtil from '../TestUtil.js';

describe('DragContainer', () => {
	const testUtil = new TestUtil(DragContainer);
	testUtil.run();

	describe('.stretch', () => {
		it('should not blow up', () => {
			testUtil.control = new DragContainer({
				container: testUtil.container,
				canDrag: true
			});

			assert.notThrows(() => {
				testUtil.control.stretch('fit');
			});
		});
	});
});
