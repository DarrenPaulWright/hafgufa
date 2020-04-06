import { Path } from '../..';
import ControlTests from '../ControlTests';
import TestUtil from '../TestUtil';

describe('Path', () => {
	const testUtil = new TestUtil(Path, true);
	const controlTests = new ControlTests(Path, testUtil);

	controlTests.run(['height', 'width']);
});
