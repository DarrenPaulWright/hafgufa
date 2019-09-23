import { Svg } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

describe('Svg', () => {
	const testUtil = new TestUtil(Svg);
	const controlTests = new ControlTests(Svg, testUtil);

	controlTests.run();
});
