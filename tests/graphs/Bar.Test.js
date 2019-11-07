import { Bar } from '../../src';
import TestUtil from '../TestUtil';
import GraphBaseTests from './GraphBaseTests';

describe('Bar', () => {
	const testUtil = new TestUtil(Bar);
	const graphBaseTests = new GraphBaseTests(Bar, testUtil, {
		mainCssClass: 'bar'
	});

	graphBaseTests.run(['onResize']);
});
