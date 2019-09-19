import { SplitView } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

const testUtil = new TestUtil(SplitView);
const controlBaseTests = new ControlTests(SplitView, testUtil);

describe('SplitView', () => {
	controlBaseTests.run();
});
