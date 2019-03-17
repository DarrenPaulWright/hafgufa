import { TextArea } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlBaseTests from '../ControlBaseTests';

const testUtil = new TestUtil(TextArea);
const controlBaseTests = new ControlBaseTests(TextArea, testUtil);

describe('TextArea', () => {
	controlBaseTests.run(['width', 'height']);
});
