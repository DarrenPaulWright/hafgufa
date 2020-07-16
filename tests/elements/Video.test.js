import { Video } from '../../index.js';
import ControlTests from '../ControlTests.js';
import TestUtil from '../TestUtil.js';

describe('Video', () => {
	const testUtil = new TestUtil(Video);
	const controlTests = new ControlTests(Video, testUtil);

	controlTests.run();
});
