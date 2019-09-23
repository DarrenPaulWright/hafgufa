import { SplitView } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

describe('SplitView', () => {
	const testUtil = new TestUtil(SplitView);
	const controlBaseTests = new ControlTests(SplitView, testUtil);

	controlBaseTests.run();
});
