import { EditRectangle } from '../../index.js';
import ControlTests from '../ControlTests.js';
import TestUtil from '../TestUtil.js';

describe('EditRectangle', () => {
	const testUtil = new TestUtil(EditRectangle, true);
	const controlTests = new ControlTests(EditRectangle, testUtil);

	controlTests.run(['height', 'width']);
});
