import { Polygon } from '../../index.js';
import TestUtil from '../TestUtil.js';

describe('Polygon', () => {
	const testUtil = new TestUtil(Polygon, true);
	testUtil.run({ skipTests: ['height', 'width'] });
});
