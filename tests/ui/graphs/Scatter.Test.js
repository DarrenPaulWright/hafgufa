import { Scatter } from '../../../src';
import TestUtil from '../../TestUtil';
import GraphBaseTests from './GraphBaseTests';

describe('Scatter', () => {
	const testUtil = new TestUtil(Scatter);
	const graphBaseTests = new GraphBaseTests(Scatter, testUtil, {
		mainCssClass: 'scatter'
	});

	graphBaseTests.run(['onResize']);
});
