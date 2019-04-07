import { assert } from 'chai';
import { DragContainer } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

const testUtil = new TestUtil(DragContainer);
const controlTests = new ControlTests(DragContainer, testUtil);

describe('DragContainer', () => {
	controlTests.run([], ['focus']);

	describe('.stretch', () => {
		it('should not blow up', () => {
			window.control = new DragContainer({
				container: window.testContainer,
				canDrag: true
			});

			assert.isOk(window.control.stretch('fit'));
		});
	});
});
