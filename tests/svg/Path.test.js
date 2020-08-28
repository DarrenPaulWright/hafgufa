import { Path } from '../../index.js';
import TestUtil from '../TestUtil.js';

describe('Path', () => {
	const testUtil = new TestUtil(Path, true);
	testUtil.run({ skipTests: ['height', 'width'] });
});
