import { assert } from 'chai';
import DragContainer from '../../../src/ui/layout/DragContainer';
import TestUtil from '../../TestUtil';
import ControlBaseTests from '../ControlBaseTests';

const testUtil = new TestUtil(DragContainer);
const controlBaseTests = new ControlBaseTests(DragContainer, testUtil);

describe('DragContainer', () => {
	controlBaseTests.run([], ['focus']);

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
