import { LightBox } from '../../index.js';
import ControlTests from '../ControlTests.js';
import TestUtil from '../TestUtil.js';

describe('LightBox', () => {
	const testUtil = new TestUtil(LightBox);
	const controlTests = new ControlTests(LightBox, testUtil);

	controlTests.run(['container', 'element']);
});
