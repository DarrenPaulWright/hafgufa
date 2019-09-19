import { G } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

const testUtil = new TestUtil(G, true);
const controlTests = new ControlTests(G, testUtil);

describe('G', () => {
	controlTests.run(['height', 'width']);
});
