import { Svg } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

const testUtil = new TestUtil(Svg, true);
const controlTests = new ControlTests(Svg, testUtil);

describe('Svg', () => {
	controlTests.run();
});
