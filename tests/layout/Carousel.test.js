import { Carousel } from '../..';
import ControlTests from '../ControlTests';
import TestUtil from '../TestUtil';

describe('Carousel', () => {
	const testUtil = new TestUtil(Carousel);
	const controlBaseTests = new ControlTests(Carousel, testUtil);

	controlBaseTests.run();
});
