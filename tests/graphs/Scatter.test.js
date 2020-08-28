import { Scatter } from '../../index.js';
import TestUtil from '../TestUtil.js';

describe('Scatter', () => {
	const testUtil = new TestUtil(Scatter);
	testUtil.run({
		skipTests: ['onResize'],
		mainCssClass: 'scatter'
	});
});
