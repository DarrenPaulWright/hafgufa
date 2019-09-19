import { Donut } from '../../../src';
import TestUtil from '../../TestUtil';
import GraphBaseTests from './GraphBaseTests';

const testUtil = new TestUtil(Donut);
const graphBaseTests = new GraphBaseTests(Donut, testUtil, {
	mainCssClass: 'donut'
});

describe('Donut', () => {
	graphBaseTests.run(['onResize']);
});
