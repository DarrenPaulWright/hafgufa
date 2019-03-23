import { Toolbar } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlBaseTests from '../ControlBaseTests';

const testUtil = new TestUtil(Toolbar);
const controlBaseTests = new ControlBaseTests(Toolbar, testUtil);

describe('Toolbar', () => {
	controlBaseTests.run();
});
