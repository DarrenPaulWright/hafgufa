import { SplitView } from '../../index.js';
import ControlTests from '../ControlTests.js';
import TestUtil from '../TestUtil.js';

describe('SplitView', () => {
	const testUtil = new TestUtil(SplitView);
	const controlBaseTests = new ControlTests(SplitView, testUtil);

	controlBaseTests.run();
});
