import { Group } from '../..';
import ControlHeadingMixinTests from '../mixins/ControlHeadingMixinTests';
import TestUtil from '../TestUtil';

describe('Group', () => {
	const testUtil = new TestUtil(Group);
	const controlHeadingMixinTests = new ControlHeadingMixinTests(Group, testUtil);

	controlHeadingMixinTests.run(['width', 'height']);
});
