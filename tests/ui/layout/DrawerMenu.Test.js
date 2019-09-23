import { DrawerMenu } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlTests from './../ControlTests';

describe('DrawerMenu', () => {
	const testUtil = new TestUtil(DrawerMenu);
	const controlBaseTests = new ControlTests(DrawerMenu, testUtil);

	controlBaseTests.run(['onResize']);
});
