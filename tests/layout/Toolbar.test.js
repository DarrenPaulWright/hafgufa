import { Toolbar } from '../../index.js';
import ControlTests from '../ControlTests.js';
import TestUtil from '../TestUtil.js';

describe('Toolbar', () => {
	const testUtil = new TestUtil(Toolbar);
	const controlTests = new ControlTests(Toolbar, testUtil);

	controlTests.run();
});
