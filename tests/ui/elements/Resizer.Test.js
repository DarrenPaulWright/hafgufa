import { Resizer } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

const testUtil = new TestUtil(Resizer);
const controlTests = new ControlTests(Resizer, testUtil);

describe('Resizer', () => {
	controlTests.run();
});
