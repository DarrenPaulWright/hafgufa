import { Div } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlBaseTests from '../ControlBaseTests';

const testUtil = new TestUtil(Div);
const controlBaseTests = new ControlBaseTests(Div, testUtil);

describe('Div', () => {
	controlBaseTests.run();
});
