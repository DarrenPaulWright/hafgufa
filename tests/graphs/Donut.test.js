import { Donut } from '../../index.js';
import TestUtil from '../TestUtil.js';

describe('Donut', () => {
	const testUtil = new TestUtil(Donut);
	testUtil.run({
		skipTests: ['onResize'],
		mainCssClass: 'donut'
	});
});
