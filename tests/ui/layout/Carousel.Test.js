import { Carousel } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

const testUtil = new TestUtil(Carousel);
const controlBaseTests = new ControlTests(Carousel, testUtil);

describe('Carousel', () => {
	controlBaseTests.run();
});
