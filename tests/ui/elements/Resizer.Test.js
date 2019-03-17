import { Resizer } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlBaseTests from '../ControlBaseTests';

const testUtil = new TestUtil(Resizer);
const controlBaseTests = new ControlBaseTests(Resizer, testUtil);

describe('Resizer', () => {
	controlBaseTests.run();
});
