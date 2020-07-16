import { VectorEditor } from '../../index.js';
import ControlTests from '../ControlTests.js';
import TestUtil from '../TestUtil.js';

describe('VectorEditor', () => {
	const testUtil = new TestUtil(VectorEditor);
	const controlTests = new ControlTests(VectorEditor, testUtil);

	controlTests.run();
});
