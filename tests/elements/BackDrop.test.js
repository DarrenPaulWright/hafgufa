import { BackDrop } from '../../index.js';
import TestUtil from '../TestUtil.js';

describe('BackDrop', () => {
	const testUtil = new TestUtil(BackDrop);
	testUtil.run({ skipTests: ['container', 'stopPropagation'] });
});
