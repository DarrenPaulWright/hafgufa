import { Label } from '../../index.js';
import ControlTests from '../ControlTests.js';
import TestUtil from '../TestUtil.js';

describe('Label', () => {
	const testUtil = new TestUtil(Label);
	const controlTests = new ControlTests(Label, testUtil);

	controlTests.run(['width', 'height']);
});
