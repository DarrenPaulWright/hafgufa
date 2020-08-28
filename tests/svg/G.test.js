import { G } from '../../index.js';
import TestUtil from '../TestUtil.js';

describe('G', () => {
	const testUtil = new TestUtil(G, true);
	testUtil.run({ skipTests: ['height', 'width'] });
});
