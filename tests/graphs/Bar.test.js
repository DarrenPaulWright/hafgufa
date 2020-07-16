import { Bar } from '../../index.js';
import TestUtil from '../TestUtil.js';
import GraphBaseTests from './GraphBaseTests.js';

describe('Bar', () => {
	const testUtil = new TestUtil(Bar);
	const graphBaseTests = new GraphBaseTests(Bar, testUtil, {
		mainCssClass: 'bar'
	});

	graphBaseTests.run(['onResize']);
});
