import { Polygon } from '../../index.js';
import ControlTests from '../ControlTests.js';
import TestUtil from '../TestUtil.js';

describe('Polygon', () => {
	const testUtil = new TestUtil(Polygon, true);
	const controlTests = new ControlTests(Polygon, testUtil);

	controlTests.run(['height', 'width']);
});
