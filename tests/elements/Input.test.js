import { Input } from '../../index.js';
import ControlTests from '../ControlTests.js';
import TestUtil from '../TestUtil.js';

describe('Input', () => {
	const testUtil = new TestUtil(Input);
	const controlTests = new ControlTests(Input, testUtil);

	controlTests.run(['width', 'height']);
});
