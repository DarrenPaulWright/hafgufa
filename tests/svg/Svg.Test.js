import { Svg } from '../../src';
import ControlTests from '../ControlTests';
import TestUtil from '../TestUtil';

describe('Svg', () => {
	const testUtil = new TestUtil(Svg);
	const controlTests = new ControlTests(Svg, testUtil);

	controlTests.run();
});
