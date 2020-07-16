import { LightBox } from '../../index.js';
import ControlTests from '../ControlTests.js';
import TestUtil from '../TestUtil.js';

describe('LightBox', () => {
	const testUtil = new TestUtil(LightBox);
	const controlBaseTests = new ControlTests(LightBox, testUtil);

	controlBaseTests.run(['container', 'element']);
});
