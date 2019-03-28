import { TextArea } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

const testUtil = new TestUtil(TextArea);
const controlTests = new ControlTests(TextArea, testUtil);

describe('TextArea', () => {
	controlTests.run(['width', 'height']);
});
