import { Group } from '../../index.js';
import TestUtil from '../TestUtil.js';

describe('Group', () => {
	const testUtil = new TestUtil(Group);
	testUtil.run({
		skipTests: ['width', 'height']
	});
});
