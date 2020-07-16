import { Carousel } from '../../index.js';
import ControlTests from '../ControlTests.js';
import TestUtil from '../TestUtil.js';

describe('Carousel', () => {
	const testUtil = new TestUtil(Carousel);
	const controlBaseTests = new ControlTests(Carousel, testUtil);

	controlBaseTests.run();
});
