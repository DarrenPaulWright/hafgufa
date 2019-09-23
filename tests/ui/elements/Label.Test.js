import { Label } from '../../../src';
import TestUtil from '../../TestUtil';
import ControlTests from '../ControlTests';

describe('Label', () => {
	const testUtil = new TestUtil(Label);
	const controlTests = new ControlTests(Label, testUtil);

	controlTests.run(['width', 'height']);
});
