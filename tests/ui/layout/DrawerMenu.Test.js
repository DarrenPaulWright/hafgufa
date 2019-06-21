import { DrawerMenu } from '../../../src/';
import TestUtil from '../../TestUtil';
import ControlTests from './../ControlTests';

const testUtil = new TestUtil(DrawerMenu);
const controlBaseTests = new ControlTests(DrawerMenu, testUtil);

describe('DrawerMenu', () => {
	controlBaseTests.run(['onResize']);
});
