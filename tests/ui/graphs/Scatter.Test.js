import { Scatter } from '../../../src/';
import TestUtil from '../../TestUtil';
import GraphBaseTests from './GraphBaseTests';

const testUtil = new TestUtil(Scatter);
const graphBaseTests = new GraphBaseTests(Scatter, testUtil, {
	mainCssClass: 'scatter'
});

describe('Scatter', () => {
	graphBaseTests.run(['onResize']);
});
