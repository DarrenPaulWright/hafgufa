import { DrawerMenu } from '../../index.js';
import ControlTests from '../ControlTests.js';
import TestUtil from '../TestUtil.js';

describe('DrawerMenu', () => {
	const testUtil = new TestUtil(DrawerMenu);
	const controlBaseTests = new ControlTests(DrawerMenu, testUtil);

	controlBaseTests.run(['onResize']);
});
