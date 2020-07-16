import { DragPoint } from '../../index.js';
import ControlTests from '../ControlTests.js';
import TestUtil from '../TestUtil.js';

describe('DragPoint', () => {
	const testUtil = new TestUtil(DragPoint, true);
	const controlTests = new ControlTests(DragPoint, testUtil);

	controlTests.run(['height', 'width']);
});
