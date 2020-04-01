import { Toolbar } from '../..';
import ControlTests from '../ControlTests';
import TestUtil from '../TestUtil';

describe('Toolbar', () => {
	const testUtil = new TestUtil(Toolbar);
	const controlTests = new ControlTests(Toolbar, testUtil);

	controlTests.run();
});
