import { Svg } from '../../index.js';
import ControlTests from '../ControlTests.js';
import TestUtil from '../TestUtil.js';

describe('Svg', () => {
	const testUtil = new TestUtil(Svg);
	const controlTests = new ControlTests(Svg, testUtil);

	controlTests.run();
});
