import { Polygon } from '../..';
import ControlTests from '../ControlTests';
import TestUtil from '../TestUtil';

describe('Polygon', () => {
	const testUtil = new TestUtil(Polygon, true);
	const controlTests = new ControlTests(Polygon, testUtil);

	controlTests.run(['height', 'width']);
});
