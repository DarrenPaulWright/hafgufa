import { Input } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlBaseTests from '../ControlBaseTests';

const testUtil = new TestUtil(Input);
const controlBaseTests = new ControlBaseTests(Input, testUtil);

describe('Input', () => {
	controlBaseTests.run(['width', 'height']);
});
