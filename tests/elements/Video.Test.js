import { Video } from '../../src';
import ControlTests from '../ControlTests';
import TestUtil from '../TestUtil';

describe('Video', () => {
	const testUtil = new TestUtil(Video);
	const controlTests = new ControlTests(Video, testUtil);

	controlTests.run();
});
