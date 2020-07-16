import { assert } from 'type-enforcer';
import { DragContainer } from '../../index.js';
import ControlTests from '../ControlTests.js';
import TestUtil from '../TestUtil.js';

describe('DragContainer', () => {
	const testUtil = new TestUtil(DragContainer);
	const controlTests = new ControlTests(DragContainer, testUtil);

	controlTests.run([], ['focus']);

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
