import { Timeline } from '../../index.js';
import ControlTests from '../ControlTests.js';
import TestUtil from '../TestUtil.js';

describe('Timeline', () => {
	const testUtil = new TestUtil(Timeline);
	const controlTests = new ControlTests(Timeline, testUtil);

	controlTests.run();
});
