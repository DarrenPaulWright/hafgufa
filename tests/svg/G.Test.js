import { G } from '../..';
import ControlTests from '../ControlTests';
import TestUtil from '../TestUtil';

describe('G', () => {
	const testUtil = new TestUtil(G, true);
	const controlTests = new ControlTests(G, testUtil);

	controlTests.run(['height', 'width']);
});
