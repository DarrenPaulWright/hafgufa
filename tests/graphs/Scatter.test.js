import { Scatter } from '../../index.js';
import TestUtil from '../TestUtil.js';
import GraphBaseTests from './GraphBaseTests.js';

describe('Scatter', () => {
	const testUtil = new TestUtil(Scatter);
	const graphBaseTests = new GraphBaseTests(Scatter, testUtil, {
		mainCssClass: 'scatter'
	});

	graphBaseTests.run(['onResize']);
});
