import { Group } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlHeadingMixinTests from '../mixins/ControlHeadingMixinTests';

describe('Group', () => {
	const testUtil = new TestUtil(Group);
	const controlHeadingMixinTests = new ControlHeadingMixinTests(Group, testUtil);

	controlHeadingMixinTests.run(['width', 'height']);
});
