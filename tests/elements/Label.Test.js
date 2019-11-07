import { Label } from '../../src';
import ControlTests from '../ControlTests';
import TestUtil from '../TestUtil';

describe('Label', () => {
	const testUtil = new TestUtil(Label);
	const controlTests = new ControlTests(Label, testUtil);

	controlTests.run(['width', 'height']);
});
