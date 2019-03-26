import { Group } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlHeadingMixinTests from '../mixins/ControlHeadingMixinTests';

const testUtil = new TestUtil(Group);
const controlHeadingMixinTests = new ControlHeadingMixinTests(Group, testUtil);

describe('Group', () => {
	controlHeadingMixinTests.run(['width', 'height']);
});
