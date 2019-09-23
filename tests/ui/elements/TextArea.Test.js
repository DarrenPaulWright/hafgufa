import { TextArea } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

describe('TextArea', () => {
	const testUtil = new TestUtil(TextArea);
	const controlTests = new ControlTests(TextArea, testUtil);

	controlTests.run(['width', 'height']);
});
