import { Rect } from '../../src';
import ControlTests from '../ControlTests';
import TestUtil from '../TestUtil';

describe('Rect', () => {
	const testUtil = new TestUtil(Rect, true);
	const controlTests = new ControlTests(Rect, testUtil);

	controlTests.run();
});
