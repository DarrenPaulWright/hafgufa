import { Tabs } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

describe('tabs', () => {
	const testUtil = new TestUtil(Tabs);
	const controlBaseTests = new ControlTests(Tabs, testUtil);

	controlBaseTests.run();
});
