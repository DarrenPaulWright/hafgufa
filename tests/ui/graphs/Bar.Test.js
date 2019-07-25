import { Bar } from '../../../src/';
import TestUtil from '../../TestUtil';
import GraphBaseTests from './GraphBaseTests';

const testUtil = new TestUtil(Bar);
const graphBaseTests = new GraphBaseTests(Bar, testUtil, {
	mainCssClass: 'bar'
});

describe('Bar', () => {
	graphBaseTests.run(['onResize']);
});
