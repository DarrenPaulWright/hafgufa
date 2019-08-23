import { Tabs } from '../../../src/';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

const testUtil = new TestUtil(Tabs);
const controlBaseTests = new ControlTests(Tabs, testUtil);

describe('tabs', () => {
	controlBaseTests.run();
});
