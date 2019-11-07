import { Input } from '../..';
import ControlTests from '../ControlTests';
import TestUtil from '../TestUtil';

describe('Input', () => {
	const testUtil = new TestUtil(Input);
	const controlTests = new ControlTests(Input, testUtil);

	controlTests.run(['width', 'height']);
});
