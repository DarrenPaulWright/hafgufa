import { LightBox } from '../..';
import ControlTests from '../ControlTests';
import TestUtil from '../TestUtil';

describe('LightBox', () => {
	const testUtil = new TestUtil(LightBox);
	const controlBaseTests = new ControlTests(LightBox, testUtil);

	controlBaseTests.run(['container', 'element']);
});
