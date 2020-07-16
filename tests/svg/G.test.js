import { G } from '../../index.js';
import ControlTests from '../ControlTests.js';
import TestUtil from '../TestUtil.js';

describe('G', () => {
	const testUtil = new TestUtil(G, true);
	const controlTests = new ControlTests(G, testUtil);

	controlTests.run(['height', 'width']);
});
