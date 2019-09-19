import { Timeline } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

const testUtil = new TestUtil(Timeline);
const controlBaseTests = new ControlTests(Timeline, testUtil);

describe('Timeline', () => {
	controlBaseTests.run();
});
