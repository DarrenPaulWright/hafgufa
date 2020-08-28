import { Bar } from '../../index.js';
import TestUtil from '../TestUtil.js';

describe('Bar', () => {
	const testUtil = new TestUtil(Bar);
	testUtil.run({
		skipTests: ['onResize'],
		mainCssClass: 'bar'
	});
});
