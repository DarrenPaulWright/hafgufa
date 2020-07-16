import { TextArea } from '../../index.js';
import ControlTests from '../ControlTests.js';
import TestUtil from '../TestUtil.js';

describe('TextArea', () => {
	const testUtil = new TestUtil(TextArea);
	const controlTests = new ControlTests(TextArea, testUtil);

	controlTests.run(['width', 'height']);
});
