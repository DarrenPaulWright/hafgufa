import { Group } from '../../index.js';
import ControlHeadingMixinTests from '../mixins/ControlHeadingMixinTests.js';
import TestUtil from '../TestUtil.js';

describe('Group', () => {
	const testUtil = new TestUtil(Group);
	const controlHeadingMixinTests = new ControlHeadingMixinTests(Group, testUtil);

	controlHeadingMixinTests.run(['width', 'height']);
});
