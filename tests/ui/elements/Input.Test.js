import { Input } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

describe('Input', () => {
	const testUtil = new TestUtil(Input);
	const controlTests = new ControlTests(Input, testUtil);

	controlTests.run(['width', 'height']);
});
