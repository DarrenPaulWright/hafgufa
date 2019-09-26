import { VectorEditor } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

describe('VectorEditor', () => {
	const testUtil = new TestUtil(VectorEditor);
	const controlTests = new ControlTests(VectorEditor, testUtil);

	controlTests.run();
});
