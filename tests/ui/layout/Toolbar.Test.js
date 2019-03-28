import { Toolbar } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

const testUtil = new TestUtil(Toolbar);
const controlTests = new ControlTests(Toolbar, testUtil);

describe('Toolbar', () => {
	controlTests.run();
});
