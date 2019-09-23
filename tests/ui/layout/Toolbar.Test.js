import { Toolbar } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

describe('Toolbar', () => {
	const testUtil = new TestUtil(Toolbar);
	const controlTests = new ControlTests(Toolbar, testUtil);

	controlTests.run();
});
