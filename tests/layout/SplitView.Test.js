import { SplitView } from '../..';
import ControlTests from '../ControlTests';
import TestUtil from '../TestUtil';

describe('SplitView', () => {
	const testUtil = new TestUtil(SplitView);
	const controlBaseTests = new ControlTests(SplitView, testUtil);

	controlBaseTests.run();
});
