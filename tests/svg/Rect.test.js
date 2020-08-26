import { Rect } from '../../index.js';
import ControlTests from '../ControlTests.js';
import TestUtil from '../TestUtil.js';

describe('Rect', () => {
	const testUtil = new TestUtil(Rect, true);
	const controlTests = new ControlTests(Rect, testUtil);

	controlTests.run(['height', 'width']);
});
