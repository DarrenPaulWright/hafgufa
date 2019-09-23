import { Carousel } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

describe('Carousel', () => {
	const testUtil = new TestUtil(Carousel);
	const controlBaseTests = new ControlTests(Carousel, testUtil);

	controlBaseTests.run();
});
