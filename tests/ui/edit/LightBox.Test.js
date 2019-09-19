import { LightBox } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

const testUtil = new TestUtil(LightBox);
const controlBaseTests = new ControlTests(LightBox, testUtil);

describe('LightBox', () => {
	controlBaseTests.run(['container', 'element']);
});
