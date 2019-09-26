import { EditRectangle } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

describe('EditRectangle', () => {
	const testUtil = new TestUtil(EditRectangle, true);
	const controlTests = new ControlTests(EditRectangle, testUtil);

	controlTests.run(['height', 'width']);
});
