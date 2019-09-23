import { LightBox } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

describe('LightBox', () => {
	const testUtil = new TestUtil(LightBox);
	const controlBaseTests = new ControlTests(LightBox, testUtil);

	controlBaseTests.run(['container', 'element']);
});
