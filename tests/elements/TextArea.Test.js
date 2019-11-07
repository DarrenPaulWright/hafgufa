import { TextArea } from '../../src';
import ControlTests from '../ControlTests';
import TestUtil from '../TestUtil';

describe('TextArea', () => {
	const testUtil = new TestUtil(TextArea);
	const controlTests = new ControlTests(TextArea, testUtil);

	controlTests.run(['width', 'height']);
});
