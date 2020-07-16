import { Donut } from '../../index.js';
import TestUtil from '../TestUtil.js';
import GraphBaseTests from './GraphBaseTests.js';

describe('Donut', () => {
	const testUtil = new TestUtil(Donut);
	const graphBaseTests = new GraphBaseTests(Donut, testUtil, {
		mainCssClass: 'donut'
	});

	graphBaseTests.run(['onResize']);
});
