import { Video } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

describe('Video', () => {
	const testUtil = new TestUtil(Video);
	const controlTests = new ControlTests(Video, testUtil);

	controlTests.run();
});
