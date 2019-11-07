import { Tabs } from '../../src';
import ControlTests from '../ControlTests';
import TestUtil from '../TestUtil';

describe('tabs', () => {
	const testUtil = new TestUtil(Tabs);
	const controlBaseTests = new ControlTests(Tabs, testUtil);

	controlBaseTests.run();
});
