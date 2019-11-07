import { DragPoint } from '../../src';
import ControlTests from '../ControlTests';
import TestUtil from '../TestUtil';

describe('DragPoint', () => {
	const testUtil = new TestUtil(DragPoint, true);
	const controlTests = new ControlTests(DragPoint, testUtil);

	controlTests.run(['height', 'width']);
});
