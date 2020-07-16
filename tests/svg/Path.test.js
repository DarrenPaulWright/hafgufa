import { Path } from '../../index.js';
import ControlTests from '../ControlTests.js';
import TestUtil from '../TestUtil.js';

describe('Path', () => {
	const testUtil = new TestUtil(Path, true);
	const controlTests = new ControlTests(Path, testUtil);

	controlTests.run(['height', 'width']);
});
