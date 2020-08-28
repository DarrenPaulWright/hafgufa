import { DrawerMenu } from '../../index.js';
import TestUtil from '../TestUtil.js';

describe('DrawerMenu', () => {
	const testUtil = new TestUtil(DrawerMenu);
	testUtil.run({ skipTests: ['onResize'] });
});
