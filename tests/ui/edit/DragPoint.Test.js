import { DragPoint } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

describe('DragPoint', () => {
	const testUtil = new TestUtil(DragPoint, true);
	const controlTests = new ControlTests(DragPoint, testUtil);

	controlTests.run(['height', 'width']);
});
