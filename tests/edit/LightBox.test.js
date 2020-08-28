import { LightBox } from '../../index.js';
import TestUtil from '../TestUtil.js';

describe('LightBox', () => {
	const testUtil = new TestUtil(LightBox);
	testUtil.run({ skipTests: ['container', 'element'] });
});
