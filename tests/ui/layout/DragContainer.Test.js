import { assert } from 'chai';
import DragContainer from '../../../src/ui/layout/DragContainer';
import { WINDOW } from '../../../src/utility/domConstants';
import TestUtil from '../../TestUtil';
import ControlBaseTests from '../ControlBaseTests';

const testUtil = new TestUtil(DragContainer);
const controlBaseTests = new ControlBaseTests(DragContainer, testUtil);

describe('DragContainer', () => {
	controlBaseTests.run([], ['focus']);

	describe('.stretch', () => {
		it('should not blow up', () => {
			WINDOW.control = new DragContainer({
				container: WINDOW.testContainer,
				canDrag: true
			});

			assert.isOk(WINDOW.control.stretch('fit'));
		});
	});
});
