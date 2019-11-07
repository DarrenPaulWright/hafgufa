import { VectorEditor } from '../..';
import ControlTests from '../ControlTests';
import TestUtil from '../TestUtil';

describe('VectorEditor', () => {
	const testUtil = new TestUtil(VectorEditor);
	const controlTests = new ControlTests(VectorEditor, testUtil);

	controlTests.run();
});
