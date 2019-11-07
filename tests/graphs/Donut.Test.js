import { Donut } from '../../src';
import TestUtil from '../TestUtil';
import GraphBaseTests from './GraphBaseTests';

describe('Donut', () => {
	const testUtil = new TestUtil(Donut);
	const graphBaseTests = new GraphBaseTests(Donut, testUtil, {
		mainCssClass: 'donut'
	});

	graphBaseTests.run(['onResize']);
});
