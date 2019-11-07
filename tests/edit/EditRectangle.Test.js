import { EditRectangle } from '../../src';
import ControlTests from '../ControlTests';
import TestUtil from '../TestUtil';

describe('EditRectangle', () => {
	const testUtil = new TestUtil(EditRectangle, true);
	const controlTests = new ControlTests(EditRectangle, testUtil);

	controlTests.run(['height', 'width']);
});
