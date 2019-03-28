import { Input } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

const testUtil = new TestUtil(Input);
const controlTests = new ControlTests(Input, testUtil);

describe('Input', () => {
	controlTests.run(['width', 'height']);
});
