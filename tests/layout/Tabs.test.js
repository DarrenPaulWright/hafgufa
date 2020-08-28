import { Tabs } from '../../index.js';
import ControlTests from '../ControlTests.js';
import TestUtil from '../TestUtil.js';

describe('tabs', () => {
	const testUtil = new TestUtil(Tabs);
	const controlTests = new ControlTests(Tabs, testUtil);

	controlTests.run();
});
