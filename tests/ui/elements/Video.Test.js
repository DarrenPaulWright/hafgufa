import { Video } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

const testUtil = new TestUtil(Video);
const controlTests = new ControlTests(Video, testUtil);

describe('Video', () => {
	controlTests.run();
});
