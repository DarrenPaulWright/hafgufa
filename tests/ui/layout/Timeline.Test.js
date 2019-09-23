import { Timeline } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

describe('Timeline', () => {
	const testUtil = new TestUtil(Timeline);
	const controlBaseTests = new ControlTests(Timeline, testUtil);

	controlBaseTests.run();
});
