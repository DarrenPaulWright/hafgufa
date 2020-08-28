import { Rect } from '../../index.js';
import TestUtil from '../TestUtil.js';

describe('Rect', () => {
	const testUtil = new TestUtil(Rect, true);
	testUtil.run({ skipTests: ['height', 'width'] });
});
