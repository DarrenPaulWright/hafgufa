import { G } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

describe('G', () => {
	const testUtil = new TestUtil(G, true);
	const controlTests = new ControlTests(G, testUtil);

	controlTests.run(['height', 'width']);
});
