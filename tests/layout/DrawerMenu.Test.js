import { DrawerMenu } from '../..';
import ControlTests from '../ControlTests';
import TestUtil from '../TestUtil';

describe('DrawerMenu', () => {
	const testUtil = new TestUtil(DrawerMenu);
	const controlBaseTests = new ControlTests(DrawerMenu, testUtil);

	controlBaseTests.run(['onResize']);
});
