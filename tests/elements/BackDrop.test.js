import { BackDrop } from '../..';
import ControlTests from '../ControlTests';
import TestUtil from '../TestUtil';

describe('BackDrop', () => {
	const testUtil = new TestUtil(BackDrop);
	const controlTests = new ControlTests(BackDrop, testUtil);

	controlTests.run(['container', 'stopPropagation']);
});
