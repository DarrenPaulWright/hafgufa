import { Timeline } from '../../index.js';
import ControlTests from '../ControlTests.js';
import TestUtil from '../TestUtil.js';

describe('Timeline', () => {
	const testUtil = new TestUtil(Timeline);
	const controlBaseTests = new ControlTests(Timeline, testUtil);

	controlBaseTests.run();
});
