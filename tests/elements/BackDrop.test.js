import { BackDrop } from '../../index.js';
import ControlTests from '../ControlTests.js';
import TestUtil from '../TestUtil.js';

describe('BackDrop', () => {
	const testUtil = new TestUtil(BackDrop);
	const controlTests = new ControlTests(BackDrop, testUtil);

	controlTests.run(['container', 'stopPropagation']);
});
