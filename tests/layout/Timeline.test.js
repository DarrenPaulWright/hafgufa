import { Timeline } from '../..';
import ControlTests from '../ControlTests';
import TestUtil from '../TestUtil';

describe('Timeline', () => {
	const testUtil = new TestUtil(Timeline);
	const controlBaseTests = new ControlTests(Timeline, testUtil);

	controlBaseTests.run();
});
