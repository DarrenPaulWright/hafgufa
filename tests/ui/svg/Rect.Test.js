import { Rect } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

describe('Rect', () => {
	const testUtil = new TestUtil(Rect, true);
	const controlTests = new ControlTests(Rect, testUtil);

	controlTests.run();
});
