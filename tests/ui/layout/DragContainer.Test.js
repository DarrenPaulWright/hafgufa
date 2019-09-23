import { assert } from 'chai';
import { DragContainer } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

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

			assert.isOk(testUtil.control.stretch('fit'));
		});
	});
});
